export default `/* Theme Colors - CC3322 as base using Adobe Kuler */
/* PDF Styles */
@page {
    size: letter portrait;
    @frame content_frame {
        top: 16pt;
        left: 16pt;
    }
}
@media print {
    #schema {
        max-width: auto;
    }
}
/* Standard Styles */
body {
    font-family: Cambria, serif;
    font-size: 16px;
}
h1,
h2,
h3,
h4,
h5,
h6 {
    font-family: Calibri, sans-serif;
}
h3 {
    margin-bottom: 5px;
    border-bottom: 1px solid #e3391a;
}
table {
    font-family: "Lucida Sans Unicode", sans-serif;
    font-size: 12px;
    border-collapse: collapse;
    text-align: left;
}
table caption {
    color: #C32 !important;
    text-align: left;
    font-weight: bold;
}
table thead {
    color: #E3391A !important;
    border-bottom: 1px solid #BBB;
}
table tbody tr td {
    padding-right: 5px;
}
table tbody tr td:last-child {
    padding-right: auto;
}
table td,
table table th {
    line-height: 1.15;
    vertical-align: top;
}
#schema {
    max-width: 1200px;
}
#info tr td:first-child {
    font-weight: bold;
    text-align: right;
}
#types table {
    width: 100%;
}
#types table tbody > tr:hover {
    background: #E3391A;
    color: #FFF !important;
    cursor: pointer;
}
.n {
    min-width: 2em;
    text-align: right;
}
.s {
    min-width: 7.5em;
    text-align: left;
}
.d {
    min-width: 30em;
    text-align: left;
}
.b {
    font-weight: bold;
}
.h {
    font-weight: bold;
    text-align: right;
    padding-right: 0;
}`;