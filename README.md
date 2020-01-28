# SOULVER-WEB

![IMG](soulver-web.PNG)

![](https://img.shields.io/badge/type-JS_Library-brightgreen.svg "Project type")
![](https://img.shields.io/github/repo-size/LorenzoCorbella74/soulver-web "Repository size")
![](https://img.shields.io/github/package-json/v/LorenzoCorbella74/soulver-web)

A basic remake for the web of the [Soulver App](https://www.acqualia.com/soulver/) for Mac, made for studying purpose. I've always been fascinated by spreadsheets bindings and the interpretation of sentences written in natural language and soulver-web is my effort to combine these two inputs. Just type in the blackboard and math operations will produce results in the grey right column.

## Features and TODOs
- [x] Basic styling for numbers, currencies, comments (by writing `@ textofthecomment`) and bold headers (by writing `# textoftheheader`)
- [x] expressions parsing, math functions, variables, assumtions, units (right now EUR, USD and GBP are supported) and math operations thanks to [math.js](https://mathjs.org/)
- [x] binding with rows results (by writing `R and rownumber`) and auto update
- [ ] total by writing `total` in a blanck new row and subtotals and auto update

## Demo
```bash
# 2) run the development server serving static demo pages at localhost:4000
npm start

```


## Bugs
- Uhm, ...let me know!

## Built With

Vanilla Javascript, [math.js](https://mathjs.org/)

## License

This project is licensed under the ISC License.