---
date: ''
make: 'Yamaha'
model: 'FZR 600'
year: '1991'
km: '34,000 (miles)'
price: '1000'
resourceSpaceCollection: 7

previewImage_pre: 'filestore\/jwdev\/1\/0\/7\/9_1a1114f9439ac68\/1079pre_2c2dc318503ca27.jpg?v=1632585712'
previewImage_scr: 'filestore\/jwdev\/1\/0\/7\/9_1a1114f9439ac68\/1079scr_0eda6b75fb5f86f.jpg?v=1632585712'
---

We recommend using **Static Generation** (with and without data) whenever possible because your page can be built once and served by CDN, which makes it much faster than having a server render the page on every request.

You can use Static Generation for many types of pages, including:

- Marketing pages
- Blog posts
- E-commerce product listings
- Help and documentation

You should ask yourself: "Can I pre-render this page **ahead** of a user's request?" If the answer is yes, then you should choose Static Generation.

On the other hand, Static Generation is **not** a good idea if you cannot pre-render a page ahead of a user's request. Maybe your page shows frequently updated data, and the page content changes on every request.

In that case, you can use **Server-Side Rendering**. It will be slower, but the pre-rendered page will always be up-to-date. Or you can skip pre-rendering and use client-side JavaScript to populate data.