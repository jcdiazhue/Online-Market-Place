COMMON ATTACKS: ONLINE MARKET PLACE
===================================

## Logic errors

Because the contract structure its make simple the posibility of logic errors is low
The code of the functions are short (for best compression). I try ti make that one function done one only thing
Implementing best practices reduce too the posibility of logic errors. Maybe I dont give the correct verbs to the functions (maybe too long names)
The mandatory unit test on this project help us to catch posibility bugs

## Recursive Calls

The `MarketPlace` contract dont make a lot of calls to external contracts in order to to prevent reentrancy attacks
The only external call are to the `Utilities` lib for `buyMarketPlaceStoreItem` function.
Call to the `Utilities` lib is safe because is deployed with `MarketPlace` contract.

## Integer Arithmetic Overflow

The are two integer arithmetic in the project. Into `buyMarketPlaceStoreItem` function and in the `retireMarketPlaceStoreFunds`
In `buyMarketPlaceStoreItem` the function the multiplication (saleprice * amount) can produce integer overflow. In that point for solve this possible situation we use the `multiplication` function from the `Utilities` lib checking for integer overflow.
In `retireMarketPlaceStoreFunds`, the addition operation is safe because happens after validate that the quantity of ether sent is greater/equal to the expense/cost

## Timestamp  Dependence
The marke place contract dont have any relation with time that a miner can change or manipulate

## Denial of service
I dont use loops in the contract. I only work with mappings. In that point we cant exceed the block gas limit

## Access to functions
The access to the connected account functionalities (profiles) are managed by the modifiers. There are a clear profiles struct between the owner, administrators, store owners, and users. 
Differents profiles can make differents things.
