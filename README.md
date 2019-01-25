EXPLAINS PROJECT: ONLINE MARKET PLACE

## How to set it up (run a local development server)

Compile and Deploy
------------------
1. Go to the project directory and in a new terminal execute `ganache-cli`.
2. In the first terminal execute `truffle compile` and `truffle migrate` to compile and deploy the contracts.
3. You can run tests if you want
4. Execute `npm run dev` to run a development server (lite-server on local).

Work with the app
-----------------
1. Navigate to http://localhost:3000/ for view the main UI page
2. Go to Metamask and import your mnemonic.
3. On Metamask the network must be set to `Localhost 8545`.
4. In that point you can work with the online market place.

## What does your project do?

1. The principal account must be the owner of the online market place. The app must recognize the owner showing the available functions for the owner. Now we can create an administrator account from Metamask. Once the  transaction is mined the interface will show the new administrator.
2. Change the Metamask account to a administrator account. The app must show you only the administrator functions. Now generate a new account in Metamask like a store owner.
3. Change the Metamask account to the last generate (store owner). The app must show you the store owner functions. Now you can manage your store functionalities (create, modify and delete stores and items).
4. When you have created stores and items, create a new account. Now the account must be recognized like a generic user (shopper). Here you must see all the stores on the online market place. Now you can manage your shopper functionalities (buy items, etc ...)
5. If you back to the owner account profile, you can close (safely) or re-open the market place

## Testing on Remix

Ropsten market place smart contract adress: 0xcb3F89109000f4A9741c19e40DB9586Fd884514E
Rinkeby market place smart contract adress: 0xB9F00AC14053A5bb75a2Ad9D5c296AB259b3E086

Note.- for testing in Remix, in the MarketPlace.sol replace import "../contracts/Utilities.sol"; for import "./Utilities.sol";

## OS and Software Annotations

1. Ubuntu 18.04
2. Visual Studio Code
3. Solidity 0.4.24
4. Truffle v4.1.15
5. Ganache CLI v6.2.5
