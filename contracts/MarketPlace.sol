pragma solidity ^0.4.24;

import "../contracts/Utilities.sol";

/// @title Market Place
/// @author José Carlos Díaz Huélamo
contract MarketPlace {

    // Utilities lib
    using Utilities for uint;

    // STRUCTS

    // Store on the market place
    struct MarketPlaceStore {
        string name;
        address owner;
        uint balance;
        uint numberOfItems;
        mapping (uint => Item) items;
    }

    // Item on the store market place
    struct Item {
        string name;
        string description;
        uint salePrice;
        uint stock;
    }

    // STATE

    // The owner of the contract
    address public owner;

    // The state of the market place
    bool public isCloseMarketPlace;

    // Market place administrators
    mapping (address => bool) public marketPlaceAdministrators;

    // Market place store owner
    mapping (address => bool) public marketPlaceStoreOwners;

    // Number of market place stores
    uint public numberOfMarketPlaceStores;

    // Markte place stores
    mapping (uint => MarketPlaceStore) public marketPlaceStores;

    // EVENTS

    event MarketPlaceClosed();
    event MarketPlaceOpened();
    event MarketPlaceAdministratorAdded(address indexed marketPlaceAdministrator);
    event MarketPlaceAdministratorDeleted(address indexed marketPlaceAdministrator);
    event MarketPlaceStoreOwnerAdded(address indexed marketPlaceStoreOwner);
    event MarketPlaceStoreOwnerDeleted(address indexed marketPlaceStoreOwner);
    event MarketPlaceStoreCreated(uint indexed marketPlaceStoreID, address indexed owner, string marketPlaceStoreName);
    event MarketPlaceStoreDeleted(uint indexed marketPlaceStoreID);
    event MarketPlaceStoreNameModified(uint indexed marketPlaceStoreID, string marketPlaceStoreName);    
    event MarketPlaceStoreItemAdded(uint indexed marketPlaceStoreID, uint indexed itemID, string name, string des, uint price, uint stock);    
    event MarketPlaceStoreItemDeleted(uint indexed marketPlaceStoreID, uint indexed itemID);    
    event MarketPlaceStoreItemNameModified(uint indexed marketPlaceStoreID, uint indexed marketPlaceStoreItemID, string name);
    event MarketPlaceStoreItemDescriptionModified(uint indexed marketPlaceStoreID, uint indexed itemID, string description);    
    event MarketPlaceStoreItemSalePriceModified(uint indexed marketPlaceStoreID, uint indexed itemID, uint salePrice);
    event MarketPlaceStoreItemStockModified(uint indexed marketPlaceStoreID, uint indexed itemID, uint stock);
    event MarketPlaceStoreFundsWithdrawn(uint indexed marketPlaceStoreID, address indexed owner, uint amount);    
    event MarketPlaceStoreItemSold(uint indexed marketPlaceStoreID, uint indexed marketPlaceStoreItemID, uint amount, uint expense);

    // MODIFIERS

    // The caller must be the owner of the market place
    modifier onlyMarketPlaceOwner {
        require(msg.sender == owner, "The caller must be the owner of the market place");
        _;
    }

    // The market place must be open
    modifier marketPlaceOpen {
        require(!isCloseMarketPlace, "The market place is close");
        _;
    }

    // The caller must be an marketPlace administrator
    modifier onlyMarketPlaceAdministrator {
        require(
            marketPlaceAdministrators[msg.sender], "The caller must be a market place administrator");
        _;
    }    

    // The caller must be a marketPlace store owner
    modifier onlyMarketPlaceStoresOwner {
        require(marketPlaceStoreOwners[msg.sender], "The caller must be a market place store owner");
        _;
    }

    // The caller must be the market place store owner
    modifier onlyMarketPlaceStoreOwner(uint marketPlaceStoreID) {
        require(
            msg.sender == marketPlaceStores[marketPlaceStoreID].owner, "The caller must be the market place store owner");
        _;
    }

    // The store must have enough ether to withdraw
    modifier marketPlaceStoreEnoughFunds(uint marketPlaceStoreID, uint amount) {
        require(amount <= marketPlaceStores[marketPlaceStoreID].balance, "The market place haven't got enough ether");
        _;
    }

    // The state of the market place store owner should be admitted
    modifier marketPlaceStoreOwnerAdmitted(uint marketPlaceStoreID) {
        require(
            marketPlaceStoreOwners[marketPlaceStores[marketPlaceStoreID].owner], "The state of the market place store owner should be admitted");
        _;
    }    

    // The store must have stock of the item
    modifier marketPlaceStoreItemHaveStock(uint marketPlaceStoreID, uint marketPlaceStoreItemId, uint amount) {
        require(
            amount <= marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId].stock, "Item without stock");
        _;
    }

    // Constructor
    constructor() public {
        owner = msg.sender;
    }

    // FUNCTIONS

    /// @notice Close market place
    function closeMarketPlace() public onlyMarketPlaceOwner {
        isCloseMarketPlace = true;
        emit MarketPlaceClosed();
    }

    /// @notice Open market place
    function openMarketPlace() public onlyMarketPlaceOwner {
        isCloseMarketPlace = false;
        emit MarketPlaceOpened();
    }

    /// @notice Add address to market place admininistrators
    /// @param marketPlaceAdministrator Address to add
    function addMarketPlaceAdministrator(address marketPlaceAdministrator)
        public
        marketPlaceOpen
        onlyMarketPlaceOwner
    {
        marketPlaceAdministrators[marketPlaceAdministrator] = true;
        emit MarketPlaceAdministratorAdded(marketPlaceAdministrator);
    }    

    /// @notice Delete address from market place admininistrators
    /// @param marketPlaceAdministrator Address to delete
    function deleteMarketPlaceAdministrator(address marketPlaceAdministrator)
        public
        marketPlaceOpen
        onlyMarketPlaceOwner
    {
        marketPlaceAdministrators[marketPlaceAdministrator] = true;
        emit MarketPlaceAdministratorDeleted(marketPlaceAdministrator);
    }      

    /// @notice Add address to market place store owners
    /// @param marketPlaceStoreOwner Address to add
    function addMarketPlaceStoreOwner(address marketPlaceStoreOwner)
        public
        marketPlaceOpen
        onlyMarketPlaceAdministrator
    {
        marketPlaceStoreOwners[marketPlaceStoreOwner] = true;
        emit MarketPlaceStoreOwnerAdded(marketPlaceStoreOwner);
    }

    /// @notice Delete address from market place store owners
    /// @param marketPlaceStoreOwner Address to delete
    function deleteMarketPlaceStoreOwner(address marketPlaceStoreOwner)
        public
        marketPlaceOpen
        onlyMarketPlaceAdministrator
    {
        marketPlaceStoreOwners[marketPlaceStoreOwner] = false;
        emit MarketPlaceStoreOwnerDeleted(marketPlaceStoreOwner);
    }    

    /// @notice Create a market place store
    /// @param marketPlaceStoreName Store name
    /// @return The store
    function createMarketPlaceStore(string marketPlaceStoreName)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        returns (uint marketPlaceStoreID)
    {
        marketPlaceStoreID = numberOfMarketPlaceStores++;
        marketPlaceStores[marketPlaceStoreID] = MarketPlaceStore(marketPlaceStoreName, msg.sender, 0, 0);
        emit MarketPlaceStoreCreated(marketPlaceStoreID, msg.sender, marketPlaceStoreName);
    }

    /// @notice Delete market place store and transfer the funds to the market place owner
    /// @param marketPlaceStoreID The market place store id
    function deleteMarketPlaceStore(uint marketPlaceStoreID)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        uint storeBalance = marketPlaceStores[marketPlaceStoreID].balance;
        delete marketPlaceStores[marketPlaceStoreID];
        emit MarketPlaceStoreDeleted(marketPlaceStoreID);
        msg.sender.transfer(storeBalance);
    }    

    /// @notice Modify the name of a market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreName The market place store name
    function modifyMarketPlaceStoreName(uint marketPlaceStoreID, string marketPlaceStoreName)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        marketPlaceStores[marketPlaceStoreID].name = marketPlaceStoreName;
        emit MarketPlaceStoreNameModified(marketPlaceStoreID, marketPlaceStoreName);
    }    

    /// @notice Add items to the market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param name The name of the item
    /// @param description The description of the item
    /// @param salePrice The sale price of the item
    /// @param stock The stock of the item
    /// @return The market place store item id
    function addMarketPlaceStoreItem(uint marketPlaceStoreID, string name, string description, uint salePrice, uint stock)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
        returns (uint marketPlaceStoreItemId)
    {
        MarketPlaceStore storage marketPlaceStore = marketPlaceStores[marketPlaceStoreID];
        marketPlaceStoreItemId = marketPlaceStore.numberOfItems++;
        marketPlaceStore.items[marketPlaceStoreItemId] = Item(name, description, salePrice, stock);
        emit MarketPlaceStoreItemAdded(marketPlaceStoreID, marketPlaceStoreItemId, name, description, salePrice, stock);
    }    

    /// @notice Delete item from the market place store stock
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemId  The market place store item id
    function deleteMarketPlaceStoreItem(uint marketPlaceStoreID, uint marketPlaceStoreItemId)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        delete marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId];
        emit MarketPlaceStoreItemDeleted(marketPlaceStoreID, marketPlaceStoreItemId);
    }

    /// @notice Modify the item name from the market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemId The market place store item id
    /// @param name The item name.
    function modifyMarketPlaceStoreItemName(uint marketPlaceStoreID, uint marketPlaceStoreItemId, string name)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId].name = name;
        emit MarketPlaceStoreItemNameModified(marketPlaceStoreID, marketPlaceStoreItemId, name);
    }

    /// @notice Modify the item name from the market place store
    /// @param marketPlaceStoreID The store.
    /// @param marketPlaceStoreItemId The market place store item id
    /// @param description The description of the item
    function modifyMarketPlaceStoreItemDescription(uint marketPlaceStoreID, uint marketPlaceStoreItemId, string description)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId].description = description;
        emit MarketPlaceStoreItemDescriptionModified(marketPlaceStoreID, marketPlaceStoreItemId, description);
    }

    /// @notice Modify the item sale price from the market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemId The market place store item id
    /// @param salePrice The sale price of the item
    function modifyMarketPlaceStoreItemSalePrice(uint marketPlaceStoreID, uint marketPlaceStoreItemId, uint salePrice)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId].salePrice = salePrice;
        emit MarketPlaceStoreItemSalePriceModified(marketPlaceStoreID, marketPlaceStoreItemId, salePrice);
    }

    /// @notice Modify the item stock from the market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemId The market place store item id
    /// @param stock The stock of the item
    function modifyMarketPlaceStoreItemStock(uint marketPlaceStoreID, uint marketPlaceStoreItemId, uint stock)
        public
        marketPlaceOpen
        onlyMarketPlaceStoresOwner
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
    {
        marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemId].stock = stock;
        emit MarketPlaceStoreItemStockModified(marketPlaceStoreID, marketPlaceStoreItemId, stock);
    }    

    /// @notice Retire funds from the balance of a market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param amount The amount to Retire.
    function retireMarketPlaceStoreFunds(uint marketPlaceStoreID, uint amount)
        public
        onlyMarketPlaceStoreOwner(marketPlaceStoreID)
        marketPlaceStoreEnoughFunds(marketPlaceStoreID, amount)
    {
        marketPlaceStores[marketPlaceStoreID].balance -= amount;
        emit MarketPlaceStoreFundsWithdrawn(marketPlaceStoreID, msg.sender, amount);
        msg.sender.transfer(amount);
    }    

    /// @notice Buy a item from a market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemId The market place store item id to buy
    /// @param amount The amount to buy
    function buyMarketPlaceStoreItem(uint marketPlaceStoreID, uint marketPlaceStoreItemId, uint amount)
        public
        payable
        marketPlaceOpen
        marketPlaceStoreOwnerAdmitted(marketPlaceStoreID)
        marketPlaceStoreItemHaveStock(marketPlaceStoreID, marketPlaceStoreItemId, amount)
    {
        uint expense = marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreID].salePrice.multiplication(amount);

        require(msg.value >= expense, "You have not paid enough money");

        marketPlaceStores[marketPlaceStoreItemId].balance += expense;
        marketPlaceStores[marketPlaceStoreItemId].items[marketPlaceStoreID].stock -= amount;

        emit MarketPlaceStoreItemSold(marketPlaceStoreID, marketPlaceStoreItemId, amount, expense);

        if (msg.value > expense)
            msg.sender.transfer(msg.value - expense);
    }    

    /// @notice Get the information about a market place store
    /// @param marketPlaceStoreID The market place store id
    /// @return The market place store name
    /// @return The market place store owner
    /// @return The market place store balance
    /// @return The market place store number of items
    function getMarketPlaceStore(uint marketPlaceStoreID)
        public
        view
        returns (string marketPlaceStoreName, address marketPlaceStoreOwner, uint marketPlaceStoreBalance, uint marketPlaceStoreNumberOfItems)
    {
        marketPlaceStoreName = marketPlaceStores[marketPlaceStoreID].name;
        marketPlaceStoreOwner = marketPlaceStores[marketPlaceStoreID].owner;
        marketPlaceStoreBalance = marketPlaceStores[marketPlaceStoreID].balance;
        marketPlaceStoreNumberOfItems = marketPlaceStores[marketPlaceStoreID].numberOfItems;
    }

    /// @notice Get the information about a item into a market place store
    /// @param marketPlaceStoreID The market place store id
    /// @param marketPlaceStoreItemID The market place store item id
    /// @return The market place store item name
    /// @return The market place store item description
    /// @return The market place store item sale price
    /// @return The market place store item stock
    function getMarketPlaceStoreItem(uint marketPlaceStoreID, uint marketPlaceStoreItemID)
        public
        view
        returns (string marketPlaceStoreItemName, string marketPlaceStoreItemDescription, uint marketPlaceStoreItemSalePrice, uint marketPlaceStoreItemStock)
    {
        marketPlaceStoreItemName = marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemID].name;
        marketPlaceStoreItemDescription = marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemID].description;
        marketPlaceStoreItemSalePrice = marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemID].salePrice;
        marketPlaceStoreItemStock = marketPlaceStores[marketPlaceStoreID].items[marketPlaceStoreItemID].stock;
    }
}