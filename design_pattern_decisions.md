DESIGN PATTERN DECISIONS: ONLINE MARKET PLACE
=============================================

## Architecture
I have created a market place with different kind of users/profiles (administrator, shop owner and shopper/end user)
The market place owner can create administrators (each administrators must have and address)
The administrators can create strore owners (each srore owner must have and address)
The store owners can create strores and manage items from the store
The main account is the market place owner and the rest of accounts (not administrators or strore owners) will be shoppers/end users
The shoppers (the rest os account/addresses not use for administrators or store owners) can buy items from the stores.
Each kind of users have diferents functions in relation with his profile

## Structs
The market place store (with its details) and its items are represented by the `MarketPlaceStore` struct
The `MarketPlaceStore` struct have a mapping, called items, that contains the items/products of the store.
Using a mapping, instead of an array object, the cost of the gas is lower in our transactions
Each item is an `Item` struct. The `Item` struct have its properties for the detail of the item

## Events
I launch events for each modify into the contract state, with that the web UI can follow the state of the items

## Restricting access pattern
Many functions have modifiers to manage the action access depending of the profile of the connected account
This produce that depends of the connected account, the own account wil can view some functions or other

## Fail early and fail loud pattern
That I said in (restricting access pattern), I have used a lot of modifiers access restrictions (depends of the connected account)
Those modifiers are launched before the code/functionality of the function
There are another restrictions about the stock of the item and about control that the price that you pay for an item must be higher that the sale price of the item

## Withdrawal pattern
Its pattern is used for send ether from the contract. The sales increase the funds of a store (the store owner can withdraw his funds) before there is a possible failure in the transaction of the ether

## Circuit breaker pattern
I use this pattern by using the `closeMarketPlace` and `openMarketPlace` function
