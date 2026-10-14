import Document, { Html, Head, Main, NextScript } from 'next/document'

const GERMAN_PAGES = ['/transport/de']

export default class MyDocument extends Document {
    render() {
        const lang = GERMAN_PAGES.includes(this.props.__NEXT_DATA__.page) ? 'de' : 'en'
        return (
            <Html lang={lang}>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
