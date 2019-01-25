App = {
  web3Provider: null,
  node: null,
  contracts: {},
  market: null,
  account: null,
  owner: false,
  administrator: false,
  storeOwner: false,
  shopper: false,
  storeID: null,
  isCloseMarketPlace: false,
  administrators: new Set(),
  storeOwners: new Set(),
  stores: new Map(),

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initIPFS();
  },

  initIPFS: function() {
    App.node = App.newIPFSNode();
    App.initContract();
  },

  initContract: function() {
    $.getJSON('MarketPlace.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var MarketPlaceArtifact = data;
      App.contracts.MarketPlace = TruffleContract(MarketPlaceArtifact);
    
      // Set the provider for our contract
      App.contracts.MarketPlace.setProvider(App.web3Provider);

      // Use our contract to display and update the user interface
      App.init();
    });
  },

  init: async() => {
    App.market = await App.contracts.MarketPlace.deployed();
    
    // Get the necessary information to identify the user
    App.account = await App.getAccount();
    let owner = await App.market.owner();
    App.owner = App.account == owner;
    App.administrator = await App.market.marketPlaceAdministrators(App.account);
    App.storeOwner = await App.market.marketPlaceStoreOwners(App.account);
    if (!App.owner && !App.administrator && !App.storeOwner) App.shopper = true;

    // Begin listening for events from the blockchain
    App.market.allEvents({fromBlock: 0, toBlock: 'latest'}).watch(App.handleEvent);

    // Bind event listeners for user interactions
    App.bindEvents();

    // Refresh the user interface if the account changes
    setInterval(function() {
      if (web3.eth.accounts[0] !== App.account) {
        App.account = web3.eth.accounts[0];
        App.refresh();
      }
    }, 100);

    // Show the application to the user
    App.show();
  },

  bindEvents: function() {
    $(document).on('click', '.manageMarketPlaceStore', App.handleManageMarketPlaceStore);
    $(document).on('click', '.viewMarketPlaceStores', App.handleViewMarketPlaceStores);
    $(document).on('click', '.visitStore', App.handleVisitStore);
    $(document).on('click', '.browseStores', App.handleBrowseStores);
    $(document).on('click', '.closeMarket', App.handleCloseMarket);
    $(document).on('click', '.openMarket', App.handleOpenMarket);
    $(document).on('click', '.addMarketPlaceAdministrator', App.handleAddMarketPlaceAdministrator);
    $(document).on('click', '.deleteMarketPlaceAdministrator', App.handleDeleteMarketPlaceAdministrator);
    $(document).on('click', '.addStoreOwner', App.handleAddStoreOwner);
    $(document).on('click', '.deleteStoreOwner', App.handleDeleteStoreOwner);
    $(document).on('click', '.createStore', App.handleCreateStore);
    $(document).on('click', '.deleteStore', App.handleDeleteStore);
    $(document).on('click', '.modifyStoreName', App.handleModifyStoreName);
    $(document).on('click', '.addItem', App.handleAddItem);
    $(document).on('click', '.deleteItem', App.handleDeleteItem); 
    $(document).on('click', '.modifyItemName', App.handleModifyItemName);
    $(document).on('click', '.modifyItemDescription', App.handleModifyItemDescription);
    $(document).on('click', '.modifyItemPrice', App.handleModifyItemPrice);
    $(document).on('click', '.modifyItemStock', App.handleModifyItemStock);
    $(document).on('click', '.retireFunds', App.handleRetireFunds);
    $(document).on('click', '.buyItem', App.handleBuyItem);
  },

  show: function() {
    if (App.owner) {
      App.showOwnerFunctions();
    } else if (App.administrator) {
      App.showAdministratorFunctions();
    } else if (App.storeOwner) {
      App.showStoreOwnerFunctions();
    } else {
      App.showShopperFunctions();
    }
  },

  showOwnerFunctions: function() {
    App.showStatus();
    App.showAdministrators();
    document.getElementById('ownerFunctions').style.display = "inline";
  },

  showAdministratorFunctions: function() {
    App.showStoreOwners();
    document.getElementById('administratorFunctions').style.display = "inline";
  },

  showStoreOwnerFunctions: function() {
    App.showOwnedStores();
    document.getElementById('storeOwnerFunctions').style.display = "inline";
  },

  showShopperFunctions: function() {
    App.showStores();
    document.getElementById('shopperFunctions').style.display = "inline";
  },

  // Logic for handling events from user interface

  handleManageMarketPlaceStore: function(event) {
    event.preventDefault();
    var storeID = parseInt($(event.target).data('id'));
    App.storeID = storeID;
    var store = App.stores.get(storeID);
    var name = store.name;
    document.getElementById('ownedStoreName').innerText = name;
    document.getElementById('balance').innerText = store.balance;
    App.showOwnedItems();
    document.getElementById('storeOwnerFunctions').style.display = "none";
    document.getElementById('manageMarketPlaceStore').style.display = "inline";
  },

  handleViewMarketPlaceStores: function(event) {
    event.preventDefault();
    App.storeID = null;
    App.showOwnedStores();
    document.getElementById('manageMarketPlaceStore').style.display = "none";
    document.getElementById('storeOwnerFunctions').style.display = "inline";
  },

  handleVisitStore: function(event) {
    event.preventDefault();
    var storeID = parseInt($(event.target).data('id'));
    App.storeID = storeID;
    var store = App.stores.get(storeID);
    var name = store.name;
    document.getElementById('storeName').innerText = name;
    App.showProducts();
    document.getElementById('shopperFunctions').style.display = "none";
    document.getElementById('visitStore').style.display = "inline";
  },

  handleBrowseStores: function(event) {
    event.preventDefault();
    App.storeID = null;
    App.showStores()
    document.getElementById('visitStore').style.display = "none";
    document.getElementById('shopperFunctions').style.display = "inline";
  },

  handleCloseMarket: function(event) {
    event.preventDefault();
    App.market.closeMarketPlace({account: App.account})
  },

  handleOpenMarket: function(event) {
    event.preventDefault();
    App.market.openMarketPlace({account: App.account})
  },

  handleAddMarketPlaceAdministrator: function(event) {
    event.preventDefault();
    var administrator = document.getElementById("addMarketPlaceAdministrator").value
    document.getElementById("addMarketPlaceAdministrator").value = ""
    if (administrator !== "") {
      App.market.addMarketPlaceAdministrator(administrator, {account: App.account});
    }
  },

  handleDeleteMarketPlaceAdministrator: function(event) {
    event.preventDefault();
    var administrator = $(event.target).data('id');
    App.market.deleteMarketPlaceAdministrator(administrator, {account: App.account});
  },

  handleAddStoreOwner: function(event) {
    event.preventDefault();
    var storeOwner = document.getElementById("addStoreOwner").value
    document.getElementById("addStoreOwner").value = ""
    if (storeOwner !== "") {
      App.market.addMarketPlaceStoreOwner(storeOwner, {account: App.account});
    }
  },

  handleDeleteStoreOwner: function(event) {
    event.preventDefault();
    var storeOwner = $(event.target).data('id');
    App.market.deleteMarketPlaceStoreOwner(storeOwner, {account: App.account});
  },

  handleCreateStore: function(event) {
    event.preventDefault();
    var name = document.getElementById("createStore").value
    document.getElementById("createStore").value = ""
    if (name !== "") {
      return App.market.createMarketPlaceStore(name, {account: App.account})
    }
  },

  handleDeleteStore: function(event) {
    event.preventDefault();
    var storeID = parseInt($(event.target).data('id'));
    App.market.deleteMarketPlaceStore(storeID, {account: App.account})
  },

  handleModifyStoreName: function(event) {
    var storeID = parseInt($(event.target).data('id'));
    App.prompt("Store Name").then(function(name) {
      if (name != "") {
        App.market.modifyMarketPlaceStoreName(storeID, name, {account: App.account})
      }
    });
  },

  handleAddItem: function(event) {
    event.preventDefault();
    var name = document.getElementById("itemName").value
    document.getElementById("itemName").value = "";
    var description = document.getElementById("itemDescription").value;
    document.getElementById("itemDescription").value = "";
    var price = Number(document.getElementById("itemPrice").value);
    document.getElementById("itemPrice").value = "";
    var quantity = Number(document.getElementById("itemStock").value)
    document.getElementById("itemStock").value = "";
    if (name !== "" && description !== "" && price !== "" && quantity !== "") {
      App.putIPFS(description).then(function(hash) {
        App.market.addMarketPlaceStoreItem(App.storeID, name, hash, web3.toWei(price, "ether"), quantity, {account: App.account});
      });
    }
  },

  handleDeleteItem: function(event) {
    event.preventDefault();
    var itemID = parseInt($(event.target).data('id'));
    App.market.deleteMarketPlaceStoreItem(App.storeID, itemID, {account: App.account});
  },

  handleModifyItemName: function(event) {
    event.preventDefault();
    if (!App.isCloseMarketPlace) {
      var itemID = parseInt($(event.target).data('id'));
      App.prompt("Item Name").then(function(name) {
        if (name !== "") {
          App.market.modifyMarketPlaceStoreItemName(App.storeID, itemID, name, {account: App.account});
        }
      });
    }
  },

  handleModifyItemDescription: function(event) {
    event.preventDefault();
    if (!App.isCloseMarketPlace) {
      var itemID = parseInt($(event.target).data('id'));
      App.prompt("Item Description").then(function(description) {
        if (description !== "") {
          App.putIPFS(description).then(function(hash) {
            App.market.modifyMarketPlaceStoreItemDescription(App.storeID, itemID, hash, {account: App.account});
          });
        }
      });
    }
  },

  handleModifyItemPrice: function(event) {
    event.preventDefault();
    if (!App.isCloseMarketPlace) {
      var itemID = parseInt($(event.target).data('id'));
      App.prompt("Item Sale Price").then(function(price) {
        if (price !== "") {
          App.market.modifyMarketPlaceStoreItemSalePrice(App.storeID, itemID, web3.toWei(Number(price), "ether"), {account: App.account});
        }
      });
    }
  },

  handleModifyItemStock: function(event) {
    event.preventDefault();
    if (!App.isCloseMarketPlace) {
      var itemID = parseInt($(event.target).data('id'));
      App.prompt("Item Stock").then(function(quantity) {
        if (quantity !== "") {
          App.market.modifyMarketPlaceStoreItemStock(App.storeID, itemID, parseInt(quantity), {account: App.account});
        }
      });
    }
  },

  handleRetireFunds: function(event) {
    event.preventDefault();
    var amount = document.getElementById("retireFunds").value;
    document.getElementById("retireFunds").value = "";
    if (amount !== "") {
      App.market.retireMarketPlaceStoreFunds(App.storeID, web3.toWei(Number(amount), "ether"), {account: App.account});
    }
  },

  handleBuyItem: function(event) {
    event.preventDefault();
    var itemID = parseInt($(event.target).data('id'));
    App.prompt("Amount").then(function(result) {
      if (result !== "") {
        var quantity = parseInt(result)
        var storeID = App.storeID;
        var store = App.stores.get(storeID);
        var items = store.items;
        var item = items.get(itemID);
        var price = item.price;
        var value = price * quantity;
        App.market.buyMarketPlaceStoreItem(storeID, itemID, quantity, {account: App.account, value: web3.toWei(value, "ether")})
      }
    });
  },

  // Logic for handling events from Ethereum blockchain

  handleEvent: function(err, result) {
    if (!err) {
      if (result.event == "MarketPlaceClosed") {
        App.handleMarketClosed();
      } else if (result.event == "MarketPlaceOpened") {
        App.handleMarketOpened();
      } else if (result.event == "MarketPlaceAdministratorAdded") {
        App.handleAdministratorAdded(result);
      } else if (result.event == "MarketPlaceAdministratorDeleted") {
        App.handleAdministratorRemoved(result);
      } else if (result.event == "MarketPlaceStoreOwnerAdded") {
        App.handleStoreOwnerAdded(result);
      } else if (result.event == "MarketPlaceStoreOwnerDeleted") {
        App.handleStoreOwnerRemoved(result);
      } else if (result.event == "MarketPlaceStoreCreated") {
        App.handleStoreCreated(result);
      } else if (result.event == "MarketPlaceStoreDeleted") {
        App.handleStoreRemoved(result);
      } else if (result.event == "MarketPlaceStoreNameModified") {
        App.handleStoreNameChanged(result);
      } else if (result.event == "MarketPlaceStoreItemAdded") {
        App.handleProductAdded(result);
      } else if (result.event == "MarketPlaceStoreItemDeleted") {
        App.handleProductRemoved(result);
      } else if (result.event == "MarketPlaceStoreItemNameModified") {
        App.handleItemNameChanged(result);
      } else if (result.event == "MarketPlaceStoreItemDescriptionModified") {
        App.handleItemDescriptionChanged(result);
      } else if (result.event == "MarketPlaceStoreItemSalePriceModified") {
        App.handleItemPriceChanged(result);
      } else if (result.event == "MarketPlaceStoreItemStockModified") {
        App.handleItemStockChanged(result);
      } else if (result.event == "MarketPlaceStoreFundsWithdrawn") {
        App.handleFundsWithdrawn(result);
      } else if (result.event == "MarketPlaceStoreItemSold") {
        App.handleProductPurchased(result);
      } else {
        console.log(result);
      }
    } else
    console.log(err);
  },

  handleMarketClosed: function() {
    App.isCloseMarketPlace = true;
    App.disableFunctions();
    if (App.owner) {
      App.showStatus();
    }
  },

  handleMarketOpened: function() {
    App.isCloseMarketPlace = false;
    App.enableFunctions();
    if (App.owner) {
      App.showStatus();
    }
  },

  handleAdministratorAdded: function(result) {
    var administrator = result.args.marketPlaceAdministrator;
    App.administrators.add(administrator);
    if (App.owner) {
      App.showAdministrators();
    }
  },

  handleAdministratorRemoved: function(result) {
    var administrator = result.args.marketPlaceAdministrator;
    App.administrators.delete(administrator);
    if (App.owner) {
      App.showAdministrators();
    }  if (App.account == administrator) {
      App.refresh();
    }
  },

  handleStoreOwnerAdded: function(result) {
    var storeOwner = result.args.marketPlaceStoreOwner;
    App.storeOwners.add(storeOwner);
    if (App.administrator) {
      App.showStoreOwners();
    } if (App.account == storeOwner) {
      App.refresh();
    }
  },

  handleStoreOwnerRemoved: function(result) {
    var storeOwner = result.args.marketPlaceStoreOwner;
    App.storeOwners.delete(storeOwner);
    if (App.administrator) {
      App.showStoreOwners();
    }
  },

  handleStoreCreated: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var owner = result.args.owner;
    var name = result.args.marketPlaceStoreName;
    var store = {"owner": owner, "name": name, "balance": 0, "items": new Map()}
    App.stores.set(storeID, store)
    if (App.storeOwner && App.account == owner && App.storeID == null) {
      App.showOwnedStores();
    } else if (App.shopper && App.storeID == null) {
      App.showStores();
    }
  },

  handleStoreRemoved: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var owner = App.stores.get(storeID).owner;
    App.stores.delete(storeID);
    if (App.storeOwner && App.account == owner && App.storeID == null) {
      App.showOwnedStores();
    } else if (App.shopper && App.storeID == null) {
      App.showStores();
    }
  },

  handleStoreNameChanged: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var name = result.args.marketPlaceStoreName;
    var owner = App.stores.get(storeID).owner;
    App.stores.get(storeID).name = name;
    if (App.storeOwner && App.account == owner && App.storeID == null) {
      App.showOwnedStores();
    } else if (App.shopper && App.storeID == null) {
      App.showStores();
    }
  },
  
  handleProductAdded: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.itemID.toNumber();
    var name = result.args.name;
    var hash = result.args.des;
    var price = web3.fromWei(result.args.price, "ether").toNumber();
    var quantity = result.args.stock.toNumber();
    var store = App.stores.get(storeID);
    var items = store.items;
    var item = {"name": name, "hash": hash, "description": null, "price": price, "quantity": quantity};
    items.set(itemID, item);
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
    App.getIPFS(hash).then(App.handleIPFS(storeID, itemID));
  },

  handleProductRemoved: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.itemID.toNumber();
    var store = App.stores.get(storeID);
    var items = store.items;
    items.delete(itemID);
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
  },

  handleItemNameChanged: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.marketPlaceStoreItemID.toNumber();
    var name = result.args.name;
    var store = App.stores.get(storeID);
    var items = store.items
    var item = items.get(itemID);
    item.name = name;
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
  },

  handleItemDescriptionChanged: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.itemID.toNumber();
    var hash = result.args.description;
    var store = App.stores.get(storeID);
    var items = store.items
    var item = items.get(itemID);
    item.hash = hash;
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
    App.getIPFS(hash).then(App.handleIPFS(storeID, itemID));
  },

  handleItemPriceChanged: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.itemID.toNumber();
    var price = web3.fromWei(result.args.salePrice, "ether").toNumber();
    var store = App.stores.get(storeID);
    var items = store.items;
    var item = items.get(itemID);
    item.price = price;
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
  },

  handleItemStockChanged: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.itemID.toNumber();
    var quantity = result.args.stock.toNumber();
    var store = App.stores.get(storeID);
    var items = store.items
    var item = items.get(itemID);
    item.quantity = quantity;
    if (App.storeOwner && storeID == App.storeID) {
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
  },

  handleFundsWithdrawn: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var amount = web3.fromWei(result.args.amount, "ether").toNumber();
    var store = App.stores.get(storeID);
    store.balance -= amount
    if (App.storeOwner && storeID == App.storeID) {
      App.showBalance();
    }
  },

  handleProductPurchased: function(result) {
    var storeID = result.args.marketPlaceStoreID.toNumber();
    var itemID = result.args.marketPlaceStoreItemID.toNumber();
    var quantity = result.args.amount.toNumber();
    var amount = web3.fromWei(result.args.expense, "ether").toNumber();
    var store = App.stores.get(storeID);
    var items = store.items;
    var item = items.get(itemID);
    item.quantity -= quantity;
    store.balance += amount;
    if (App.storeOwner && storeID == App.storeID) {
      App.showBalance();
      App.showOwnedItems();
    } else if (App.shopper && storeID == App.storeID) {
      App.showProducts();
    }
  },

  // Functions to update user interface elements

  showStatus: function() {
    if (App.isCloseMarketPlace) {
      document.getElementById("status").innerText = "closed";
    } else {
      document.getElementById("status").innerText = "open";
    }
  },

  showAdministrators: function() {
    var administratorsRow = $('#administratorsRow');
    var administratorTemplate = $('#administratorTemplate');
    administratorsRow.empty();
    for (var administrator of App.administrators) {
      administratorTemplate.find('.address').text(administrator);
      administratorTemplate.find('.deleteMarketPlaceAdministrator').attr('data-id', administrator);;
      administratorsRow.append(administratorTemplate.html());
    }
  },

  showStoreOwners: function() {
    var storeOwnersRow = $('#storeOwnersRow');
    var storeOwnerTemplate = $('#storeOwnerTemplate');
    storeOwnersRow.empty();
    for (var storeOwner of App.storeOwners) {
      storeOwnerTemplate.find('.address').text(storeOwner);
      storeOwnerTemplate.find('.deleteStoreOwner').attr('data-id', storeOwner);;
      storeOwnersRow.append(storeOwnerTemplate.html());
    }
  },

  showOwnedStores: function() {
    var storesRow = $('#ownedStoresRow');
    var storeTemplate = $('#ownedStoreTemplate');
    storesRow.empty();
    for (var [storeID, store] of App.stores) {
      if (App.account == store.owner) {
        storeTemplate.find('.storeName').text(store.name);
        storeTemplate.find('.manageMarketPlaceStore').attr('data-id', storeID);
        storeTemplate.find('.modifyStoreName').attr('data-id', storeID);
        storeTemplate.find('.deleteStore').attr('data-id', storeID);
        storesRow.append(storeTemplate.html());
      }
    }
    App.storeOwner = true;
  },

  showBalance: function() {
    document.getElementById("balance").innerText = App.stores.get(App.storeID).balance
  },

  showOwnedItems: function() {
    var storeID = App.storeID;
    var store = App.stores.get(storeID);
    var items = store.items
    var itemsRow = $('#ownedItemsRow');
    var itemTemplate = $('#ownedItemTemplate');
    itemsRow.empty();
    for (var [itemID, item] of items) {
      itemTemplate.find('.itemName').text(item.name);
      if (item.description !== null) {
        itemTemplate.find('.itemDescription').text(item.description);
      } else {
        itemTemplate.find('.itemDescription').text("");
      }
      itemTemplate.find('.itemPrice').text(item.price);
      itemTemplate.find('.itemStock').text(item.quantity);
      itemTemplate.find('.modifyItemName').attr('data-id', itemID);
      itemTemplate.find('.modifyItemDescription').attr('data-id', itemID);
      itemTemplate.find('.modifyItemStock').attr('data-id', itemID);
      itemTemplate.find('.modifyItemPrice').attr('data-id', itemID);
      itemTemplate.find('.deleteItem').attr('data-id', itemID);
      itemsRow.append(itemTemplate.html());
    }
    App.storeOwner = true;
  },

  showStores: function() {
    var storesRow = $('#storesRow');
    var storeTemplate = $('#storeTemplate');
    storesRow.empty();
    for (var [storeID, store] of App.stores) {
      if (App.storeOwners.has(store.owner)) {
        storeTemplate.find('.storeName').text(store.name);
        storeTemplate.find('.visitStore').attr('data-id', storeID);
        storesRow.append(storeTemplate.html());
      }
    }
  },

  showProducts: function() {
    var storeID = App.storeID;
    var store = App.stores.get(storeID);
    var items = store.items
    var itemsRow = $('#itemsRow');
    var itemTemplate = $('#itemTemplate');
    itemsRow.empty();
    for (var [itemID, item] of items) {
      itemTemplate.find('.itemName').text(item.name);
      if (item.description !== null) {
        itemTemplate.find('.itemDescription').text(item.description);
      } else {
        itemTemplate.find('.itemDescription').text("");
      }
      itemTemplate.find('.itemPrice').text(item.price);
      itemTemplate.find('.itemStock').text(item.quantity);
      itemTemplate.find('.buyItem').attr('data-id', itemID);
      itemsRow.append(itemTemplate.html());
    }
  },

  disableFunctions: function() {
    $('.marketOpen').prop('disabled', true);
  },

  enableFunctions: function() {
    $('.marketOpen').prop('disabled', false);
  },

  refresh: async() => {
    document.getElementById('ownerFunctions').style.display = "none";
    document.getElementById('administratorFunctions').style.display = "none";
    document.getElementById('storeOwnerFunctions').style.display = "none";
    document.getElementById('manageMarketPlaceStore').style.display = "none";
    document.getElementById('shopperFunctions').style.display = "none";
    document.getElementById('visitStore').style.display = "none";
    let owner = await App.market.owner();
    App.owner = App.account == owner;
    App.administrator = await App.market.marketPlaceAdministrators(App.account);
    App.storeOwner = await App.market.marketPlaceStoreOwners(App.account);
    if (!App.owner && !App.administrator && !App.storeOwner) App.shopper = true;
    App.storeID = null;
    App.show();
  },

  // Miscellaneous helper functions

  // Wrap call to get accounts in a promise
  getAccount: function() {
    return new Promise(function(resolve, reject) {
      web3.eth.getAccounts(function(error, accounts) {
      if (!error) {
        resolve(accounts[0]);
      } else {
        reject(error);
      }
      });
    });
  },

  // Use a modal to prompt user for input and return the result
  prompt: function(message) {
    var modal = $('#modalTemplate');
    modal.find(".col-form-label").text(message);
    var promise = new Promise(function(resolve, reject) {
      var cancelButton = $("#cancelButton");
      var okayButton = $("#okayButton");
      $("#cancelButton").on("click", function() {
        cancelButton.off();
        okayButton.off();
        document.getElementById("modalText").value = "";
        modal.hide();
        resolve("");
      })
      okayButton.on("click", function() {
        var result = document.getElementById("modalText").value;
        cancelButton.off();
        okayButton.off();
        modal.hide();
        document.getElementById("modalText").value = "";
        resolve(result);
      })
    })
    modal.show();
    return promise;
  },

  // IPFS functions

  // Create a new IPFS node and return it when ready
  newIPFSNode: function() {
    return new Promise(function(resolve, reject) {
      var node = new window.Ipfs();
      node.on("ready", function() {
        resolve(node);
      });
      node.on("error", function(error) {
        reject(error);
      })
    });
  },

  // Store text on IPFS and return the hash
  putIPFS: function(text) {
    var fileBuffer = buffer.Buffer.from(text);
    return App.node.then(function(node) {
      return node.files.add(fileBuffer).then(function(result) {
        return result[0].hash;
      });
    });
  },
    
  // Return the text corresponding to an IPFS hash
  getIPFS: function(hash) {
    return App.node.then(function(node) {
      return node.files.cat(hash).then(function(fileBuffer) {
        return fileBuffer.toString();
      });
    });
  },

  // Save data received from IPFS to local storage and update the user interface
  handleIPFS: function(storeID, itemID) {
    return function(description) {
      if (App.stores.has(storeID)) {
        var items = App.stores.get(storeID).items;
        if (items.has(itemID)) {
          var item = items.get(itemID);
          item.description = description;
          if (App.storeOwner && storeID == App.storeID) {
            App.showOwnedItems();
          } else if (App.shopper && storeID == App.storeID) {
            App.showProducts();
          }
        }
      }
    };
  }
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});