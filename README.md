# Simple general AJAX website



| Attribute               | Value | Description                                                  |
| ----------------------- | ----- | ------------------------------------------------------------ |
| data-oa                 | —     | triggers ajax request                                        |
| data-oa-target          |       |                                                              |
| data-oa-history         |       |                                                              |
| data-oa-scroll          |       |                                                              |
| data-oa-submit          |       |                                                              |
|                         |       |                                                              |
| data-oa-before          |       | Function to execute before the AJAX request. If return FALSE, exit |
| data-oa-callback        |       | Function to execute after the AJAX request                   |
| data-oa-confirm         |       |                                                              |
| data-oa-reset-on-cancel |       | Reset form if AJAX request was cancelled                     |



## Server response

| Field   | Type                        | Description |
| ------- | --------------------------- | ----------- |
| success | bool                        |             |
| html    | text                        |             |
| alerts  | [{title, text. style, url}] |             |

## Additionals

| Files          | Description                               |
| -------------- | ----------------------------------------- |
| docready.js    | https://github.com/jfriend00/docReady     |
| vanilla-notify | https://github.com/MLaritz/Vanilla-Notify |



// Examples:
// 1) <a href="[...]" data-oa data-oa-target="#target;#main" data-oa-history data-oa-scroll="#target">[...]</a>
// 2) <form method="post" action="[...]" data-oa>[...]</form>
// 3) <form method="post" action="[...]" data-oa>[...]<a href="javascript:void(0)" data-oa-submit>[...]</a>[...]</form>
// 4) <form id="form-id" method="post" action="[...]" data-oa>[...]</form>[...] <a href="javascript:void(0)" data-oa-submit="#form-id">[...]</a>

