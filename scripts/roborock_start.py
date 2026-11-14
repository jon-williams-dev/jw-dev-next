"""Starts the Roborock vacuum for the Stauperle 13 kiosk (/api/roborock runs this).

Uses python-roborock, the library behind Home Assistant's Roborock integration. Setup on the
Pi, once, from the project folder:

  python3 -m venv .venv-roborock
  .venv-roborock/bin/pip install python-roborock
  .venv-roborock/bin/python scripts/roborock_start.py login you@example.com

`login` asks Roborock to email a code to your Roborock app account and saves the session to
.roborock.json (git-ignored). After that, `start` starts a full clean and prints one JSON line.
"""
import asyncio
import json
import pathlib
import sys

from roborock import RoborockCommand
from roborock.data.containers import UserData
from roborock.devices.device_manager import UserParams, create_device_manager
from roborock.devices.file_cache import FileCache
from roborock.web_api import RoborockApiClient

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUTH_FILE = ROOT / '.roborock.json'
CACHE_FILE = ROOT / '.roborock.cache'  # device list and keys, so a start doesn't refetch them
CONNECT_TIMEOUT = 30  # seconds


async def login(email):
    api = RoborockApiClient(username=email)
    await api.request_code()
    code = input(f'Code from the email sent to {email}: ').strip()
    user_data = await api.code_login(code)
    AUTH_FILE.write_text(json.dumps({'email': email, 'user_data': user_data.as_dict()}))
    AUTH_FILE.chmod(0o600)
    print(f'Saved to {AUTH_FILE}')


async def start():
    if not AUTH_FILE.exists():
        raise RuntimeError('Not logged in: run scripts/roborock_start.py login on the Pi')
    auth = json.loads(AUTH_FILE.read_text())
    params = UserParams(username=auth['email'], user_data=UserData.from_dict(auth['user_data']))
    manager = await create_device_manager(params, cache=FileCache(CACHE_FILE))
    try:
        vacuums = [d for d in await manager.get_devices() if d.v1_properties]
        if not vacuums:
            raise RuntimeError('No Roborock vacuum found on this account')
        vacuum = vacuums[0]
        # The manager connects in the background; give it a moment on a slow start.
        for _ in range(CONNECT_TIMEOUT * 2):
            if vacuum.is_connected:
                break
            await asyncio.sleep(0.5)
        else:
            raise RuntimeError(f'Could not reach {vacuum.name}')
        await vacuum.v1_properties.command.send(RoborockCommand.APP_START)
        return {'ok': True, 'name': vacuum.name}
    finally:
        await manager.close()


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else ''
    if command == 'login' and len(sys.argv) == 3:
        asyncio.run(login(sys.argv[2]))
    elif command == 'start':
        try:
            print(json.dumps(asyncio.run(start())))
        except Exception as e:  # reported to the kiosk as JSON, not a traceback
            print(json.dumps({'ok': False, 'error': str(e) or type(e).__name__}))
            sys.exit(1)
    else:
        print('Usage: roborock_start.py login <email> | start', file=sys.stderr)
        sys.exit(2)


if __name__ == '__main__':
    main()
