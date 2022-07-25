wafflook/[nodistx](https://github.com/wafflook/nodistx)

## 🐿️ Nodistx
A fork of Nodist, but `nodistx` allows you to quickly install and use different versions of node via the table-prompt.
## 📡 Installing and Updating
To install or update nodistx, you should run the install script. To do that, you may run the install.bat.
## 📦 Example
```bat
C:\Users\wafflook>nodistx
Press <enter> to select <Up and Down> to move rows <Left and Right> to move pages
┌─────────────┬─────────┬────────┬─────────────┬────────┬────────┬─────────┬─────────┬─────┬──────────┬───────────┐
│ 1-10 of 689 │ version │ npm    │ v8          │ uv     │ zlib   │ openssl │ modules │ lts │ security │ installed │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-07-13  │ 18.6.0  │ 8.13.2 │ 10.2.154.13 │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │ YES       │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-07-06  │ 18.5.0  │ 8.12.1 │ 10.2.154.4  │ 1.43.0 │ 1.2.11 │         │ 108     │     │ YES      │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-06-16  │ 18.4.0  │ 8.12.1 │ 10.2.154.4  │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-06-02  │ 18.3.0  │ 8.11.0 │ 10.2.154.4  │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-05-17  │ 18.2.0  │ 8.9.0  │ 10.1.124.8  │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-05-03  │ 18.1.0  │ 8.8.0  │ 10.1.124.8  │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-04-18  │ 18.0.0  │ 8.6.0  │ 10.1.124.8  │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-06-01  │ 17.9.1  │ 8.11.0 │ 9.6.180.15  │ 1.43.0 │ 1.2.11 │         │ 102     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-04-07  │ 17.9.0  │ 8.5.5  │ 9.6.180.15  │ 1.43.0 │ 1.2.11 │         │ 102     │     │          │           │
├─────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-03-22  │ 17.8.0  │ 8.5.5  │ 9.6.180.15  │ 1.43.0 │ 1.2.11 │         │ 102     │     │          │           │
└─────────────┴─────────┴────────┴─────────────┴────────┴────────┴─────────┴─────────┴─────┴──────────┴───────────┘
```
Easy as that!
```bat
C:\Users\wafflook>nodistx use
 Press <enter> to select <Up and Down> to move rows <Left and Right> to move pages
┌────────────┬─────────┬────────┬─────────────┬────────┬────────┬─────────┬─────────┬─────┬──────────┬───────────┐
│ 1-2 of 2   │ version │ npm    │ v8          │ uv     │ zlib   │ openssl │ modules │ lts │ security │ installed │
├────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2022-07-13 │ 18.6.0  │ 8.13.2 │ 10.2.154.13 │ 1.43.0 │ 1.2.11 │         │ 108     │     │          │ YES       │
├────────────┼─────────┼────────┼─────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2019-03-28 │ 11.13.0 │ 6.7.0  │ 7.0.276.38  │ 1.27.0 │ 1.2.11 │         │ 67      │     │          │ YES       │
└────────────┴─────────┴────────┴─────────────┴────────┴────────┴─────────┴─────────┴─────┴──────────┴───────────┘
```
```bat
C:\Users\wafflook>nodistx chk
 Press <enter> to select <Up and Down> to move rows <Left and Right> to move pages
┌────────────┬─────────┬───────┬────────────┬────────┬────────┬─────────┬─────────┬─────┬──────────┬───────────┐
│ 1-1 of 1   │ version │ npm   │ v8         │ uv     │ zlib   │ openssl │ modules │ lts │ security │ installed │
├────────────┼─────────┼───────┼────────────┼────────┼────────┼─────────┼─────────┼─────┼──────────┼───────────┤
│ 2017-09-26 │ 8.6.0   │ 5.3.0 │ 6.0.287.53 │ 1.14.1 │ 1.2.11 │         │ 57      │     │          │ YES       │
└────────────┴─────────┴───────┴────────────┴────────┴────────┴─────────┴─────────┴─────┴──────────┴───────────┘
```
```bat
C:\Users\wafflook>nodistx raw `run 11.13.0 -- -v`
0.9.1
```
## 😊 Thanks
fealebenpae/[Use the Octokit client for GitHub](https://github.com/nullivex/nodist/pull/246)  
freMea/[Template.bat](https://gist.github.com/freMea/0e907150d14e68f26794207fbeec8fa0)  
SBoudrias/[Inquirer.js](https://github.com/SBoudrias/Inquirer.js/)  
nullivex/[Nodist](https://github.com/nullivex/nodist)  
