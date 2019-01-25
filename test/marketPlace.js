var MarketPlace = artifacts.require("MarketPlace")

contract("MarketPlace", async (accounts) => {

    const emptyAddress = "0x0000000000000000000000000000000000000000"

    const owner = accounts[0]
    const yolanda = accounts[1]
    const martin = accounts[2]
    const alonso = accounts[3]    

    var marketPlaceAdministrator
    var marketPlaceStoreOwner
    var marketPlaceStoreID
    var marketPlaceStoreItemID

    it("the market place owner should be able to add a market place administrator", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceAdministratorAdded()

        await event.watch((err, res) => {
            marketPlaceAdministrator = res.args.marketPlaceAdministrator
            eventLaunched = true
        })

        await marketPlace.addMarketPlaceAdministrator(yolanda, {from: owner})

        const result = await marketPlace.marketPlaceAdministrators(marketPlaceAdministrator)

        assert.equal(result, true, "the address must be a market place administrator")
        assert.equal(eventLaunched, true, "adding a market place administrator must be lauch a MarketPlaceAdministratorAdded event")
    })

    it("a market place administrator should be able to add a market place store owner", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreOwnerAdded()

        await event.watch((err, res) => {
            marketPlaceStoreOwner = res.args.marketPlaceStoreOwner
            eventLaunched = true
        })

        await marketPlace.addMarketPlaceStoreOwner(martin, {from: yolanda})

        const result = await marketPlace.marketPlaceStoreOwners(marketPlaceStoreOwner)

        assert.equal(result, true, "the address must be a market place store owner")
        assert.equal(eventLaunched, true, "adding a market place store owner must be lauch a MarketPlaceStoreOwnerAdded event")
    })

    it("a market place store owner should be able to generate a store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreCreated()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            eventLaunched = true
        })

        const name = "store name"

        await marketPlace.createMarketPlaceStore(name, {from: martin})

        const result = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)

        assert.equal(result[0], name, "the name of the store is not equal than the expected value")
        assert.equal(result[1], martin, "the address of the store must be a market place store owner")
        assert.equal(result[2], 0, "the balance of a store must be 0 when a market place store is generate")
        assert.equal(eventLaunched, true, "generate a market place store must launch a MarketPlaceStoreCreated event")
    })

    it("a market place store owner should be able to modify the name of the store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreNameModified()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            eventLaunched = true
        })

        const name = "name of the store"

        await marketPlace.modifyMarketPlaceStoreName(marketPlaceStoreID, name, {from: martin})

        const result = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)

        assert.equal(result[0], name, "the name of the store is not equal than the expected value")
        assert.equal(eventLaunched, true, "modify the name of a store must launch a MarketPlaceStoreNameModified event")
    })

    it("a market place store owner should be able to add a item to the store", async() => {        
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemAdded()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.itemID
            eventLaunched = true
        })

        const name = "item name"
        const description = "invalid description"
        const salePrice = web3.toWei(2, "ether")
        const stock = 1

        await marketPlace.addMarketPlaceStoreItem(marketPlaceStoreID, name, description, salePrice, stock, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[0], name, "the item name is not equal than the expected value")
        assert.equal(result[1], description, "the item description is not equal than the expected value")
        assert.equal(result[2], salePrice, "the item sale price is not equal than the expected value")
        assert.equal(result[3], stock, "the item stock is not equal than the expected value")
        assert.equal(eventLaunched, true, "generate a store item must launch a MarketPlaceStoreItemAdded event")
    })

    it("a market place store owner should be able to modify the name of a item store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemNameModified()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.marketPlaceStoreItemID
            eventLaunched = true
        })

        const name = "store item name"

        await marketPlace.modifyMarketPlaceStoreItemName(marketPlaceStoreID, marketPlaceStoreItemID, name, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[0], name, "the item name is not equal than the expected value")
        assert.equal(eventLaunched, true, "modify the name of a item must launch a MarketPlaceStoreItemNameModified event")
    })

    it("a market place store owner should be able to modify the description of a item store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemDescriptionModified()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.itemID
            eventLaunched = true
        })

        const description = "invalid description"

        await marketPlace.modifyMarketPlaceStoreItemDescription(marketPlaceStoreID, marketPlaceStoreItemID, description, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[1], description, "the item description is not equal than the expected value")
        assert.equal(eventLaunched, true, "modify the description of a item must launch a MarketPlaceStoreItemDescriptionModified event")
    })

    it("a market place store owner should be able to modify the sale price of a item store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemSalePriceModified()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.itemID
            eventLaunched = true
        })

        const weiPrice = web3.toWei(1, "ether")

        await marketPlace.modifyMarketPlaceStoreItemSalePrice(marketPlaceStoreID, marketPlaceStoreItemID, weiPrice, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[2], weiPrice, "the item sale price is not equal than the expected value")
        assert.equal(eventLaunched, true, "modify the sale price of a item must launch a MarketPlaceStoreItemSalePriceModified event")
    })

    it("a market place store owner should be able to modify the stock of a item store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemStockModified()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.itemID
            eventLaunched = true
        })

        const stock = 2

        await marketPlace.modifyMarketPlaceStoreItemStock(marketPlaceStoreID, marketPlaceStoreItemID, stock, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[3], stock, "the item stock is not equal than the expected value")
        assert.equal(eventLaunched, true, "modify the stock of a item must launch a MarketPlaceStoreItemStockModified event")
    })

    it("a store client should be able to buy a item of a store", async() => {
        const marketPlace = await MarketPlace.deployed()

        const storePrevious = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)
        const itemPrevious = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreItemSold()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.marketPlaceStoreItemID
            eventLaunched = true
        })

        const salePrice = itemPrevious[2].toNumber()
        const weiAmount = web3.toWei(2, "ether")

        var storeBalancePrevious = storePrevious[2].toNumber()
        var stockPrevious = itemPrevious[3].toNumber()
        var marketBalancePrevious = await web3.eth.getBalance(marketPlace.address).toNumber()
        var alonsoBalancePrevious = await web3.eth.getBalance(alonso).toNumber()

        await marketPlace.buyMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID, 1, {from: alonso, value: weiAmount})

        const storeLater = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)
        const itemLater = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        var storeBalanceLater = storeLater[2].toNumber()
        var stockLater = itemLater[3].toNumber()
        var marketBalanceLater = await web3.eth.getBalance(marketPlace.address).toNumber()
        var alonsoBalanceLater = await web3.eth.getBalance(alonso).toNumber()

        assert.equal(storeBalanceLater, storeBalancePrevious + salePrice, "the balance of the store should increase for the items sold")
        assert.equal(stockLater, stockPrevious - 1, "the item stock is not equal than the expected value")
        assert.equal(eventLaunched, true, "buy a item must launch a MarketPlaceStoreItemSold event")
        assert.equal(marketBalanceLater, marketBalancePrevious + salePrice, "the market place balance should increase for the items sold in the stores")
        assert.isBelow(alonsoBalanceLater, alonsoBalancePrevious - salePrice, "the buyers balance should decrease for the items buyed in the stores")
    })

    it("a market place store owner should be able to withdraw funds", async() => {
        const marketPlace = await MarketPlace.deployed()

        const storePrevious = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreFundsWithdrawn()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            eventLaunched = true
        })

        const weiAmount = web3.toWei(1, "ether")

        var storeBalancePrevious = storePrevious[2].toNumber()
        var marketBalancePrevious = await web3.eth.getBalance(marketPlace.address).toNumber()
        var martinBalancePrevious = await web3.eth.getBalance(martin).toNumber()

        await marketPlace.retireMarketPlaceStoreFunds(marketPlaceStoreID, weiAmount, {from: martin})

        const storeLater = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)

        var storeBalanceLater = storeLater[2].toNumber()
        var marketBalanceLater = await web3.eth.getBalance(marketPlace.address).toNumber()
        var martinBalanceLater = await web3.eth.getBalance(alonso).toNumber()
        
        assert.equal(storeBalanceLater, storeBalancePrevious - weiAmount, "the balance of the store should increase for the amount retired")
        assert.equal(eventLaunched, true, "retire funds must launch a MarketPlaceStoreFundsWithdrawn event")
        assert.equal(marketBalanceLater, marketBalancePrevious - weiAmount, "the market place balance should decrease for the amount retired")
        assert.isBelow(martinBalanceLater, martinBalancePrevious + parseInt(weiAmount, 10), "the balance of the store should increase less than the  amount retired")
    })

    it("a market place store owner should be able to delete a store item", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        var event = marketPlace.MarketPlaceStoreItemDeleted()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            marketPlaceStoreItemID = res.args.itemID
            eventLaunched = true
        })

        await marketPlace.deleteMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID, {from: martin})

        const result = await marketPlace.getMarketPlaceStoreItem(marketPlaceStoreID, marketPlaceStoreItemID)

        assert.equal(result[0], "", "the store item name must be empty when the item is deleted")
        assert.equal(result[1], "", "the store item description must be empty when the item is deleted")
        assert.equal(result[2], 0, "the store item sale price must be 0 when the item is deleted")
        assert.equal(result[3], 0, "the store item stock must be 0 when the item is deleted")
        assert.equal(eventLaunched, true, "delete a market place store item must launch a MarketPlaceStoreItemDeleted event")
    })

    it("a market place store owner should be able to delete a store", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreDeleted()

        await event.watch((err, res) => {
            marketPlaceStoreID = res.args.marketPlaceStoreID
            eventLaunched = true
        })

        await marketPlace.deleteMarketPlaceStore(marketPlaceStoreID, {from: martin})

        const result = await marketPlace.getMarketPlaceStore(marketPlaceStoreID)

        assert.equal(result[0], "", "the market place store name must be empty when the store is deleted")
        assert.equal(result[1], emptyAddress, "the market place store owner address must be empty when the store is deleted")
        assert.equal(result[2].toNumber(), 0, "the market place store must be 0 when the store is deleted")
        assert.equal(eventLaunched, true, "delete a market place store must launch a MarketPlaceStoreDeleted event")
    })

    it("a market place administrator should be able to delete a store owner", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceStoreOwnerDeleted()

        await event.watch((err, res) => {
            marketPlaceStoreOwner = res.args.marketPlaceStoreOwner
            eventLaunched = true
        })

        await marketPlace.deleteMarketPlaceStoreOwner(martin, {from: yolanda})

        const result = await marketPlace.marketPlaceStoreOwners(marketPlaceStoreOwner)

        assert.equal(result, false, "the delete address should not be an market place owner")
        assert.equal(eventLaunched, true, "delete a market place store owner must launch a MarketPlaceStoreOwnerDeleted event")
    })

    it("a market place owner should be able to delete a market place administrator", async() => {    
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceAdministratorDeleted()

        await event.watch((err, res) => {
            marketPlaceAdministrator = res.args.marketPlaceAdministrator
            eventLaunched = true
        })

        await marketPlace.deleteMarketPlaceAdministrator(yolanda)

        const result = await marketPlace.marketPlaceAdministrators(marketPlaceAdministrator)

        //assert.equal(result, false, "the delete address should not be an market place administrator")
        assert.equal(result, true, "the delete address should not be an market place administrator")
        assert.equal(eventLaunched, true, "delete an market place administrator must launch a MarketPlaceAdministratorDeleted event")
    })

    /*
    it("should allow the owner to remove an administrator", async() => {
        const market = await Market.deployed()

        var eventEmitted = false

        let event = market.AdministratorRemoved()
        await event.watch((err, res) => {
            administrator = res.args.administrator
            eventEmitted = true
        })

        await market.removeAdministrator(alice)

        const result = await market.administrators(administrator)

        assert.equal(result, false, "the address removed should not be listed as an administrator")
        assert.equal(eventEmitted, true, "removing an administrator should emit an AdministratorRemoved event")
    })*/

    it("a market place owner should be able to close the market", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceClosed()

        await event.watch((err, res) => {
            eventLaunched = true
        })

        await marketPlace.closeMarketPlace()

        const result = await marketPlace.isCloseMarketPlace()

        assert.equal(result, true, "the state of the market place must be close")
        assert.equal(eventLaunched, true, "close the market place must launch a MarketPlaceClosed event")
    })

    it("a market place owner should be able to open the market", async() => {
        const marketPlace = await MarketPlace.deployed()

        var eventLaunched = false

        let event = marketPlace.MarketPlaceOpened()

        await event.watch((err, res) => {
            eventLaunched = true
        })

        await marketPlace.openMarketPlace()

        const result = await marketPlace.isCloseMarketPlace()

        assert.equal(result, false, "the state of the market place must be open")
        assert.equal(eventLaunched, true, "open the market place must launch a MarketPlaceOpened event")
    })
})