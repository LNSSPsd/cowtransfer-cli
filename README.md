# cowtransfer-cli
Download items from CowTransfer in your console.
## Install dependencies
Install dependencies by using command `npm i`,  
For example:
```
git clone git@github.com:LNSSPsd/cowtransfer-cli.git
cd cowtransfer-cli
npm i
```
## Usage
### Download
```
node main.js d <link> [optional output filename]
```
Example:
```
node main.js d https://c-t.work/s/de7153f5c36340
# (output file: LICENSE)
```
or
```
node main.js d https://c-t.work/s/de7153f5c36340 test.txt
# (output file: test.txt)
```
### Upload
```
node main.js u <filename>
```
Example:
```
node main.js u LICENSE
# Output:
# File successfully uploaded.
# Download link: https://c-t.work/s/de7153f5c36340
# Expires after 336 days.
```

