const TestTradeHistory = artifacts.require("TestTradeHistory")

contract('TradeHistory',  async(accounts) => {
  let tradeHistoryTest;
  const GET_TRADES_LIMIT_DEFAULT = 10
  const TIME_RANGE_DEFAULT = [0, 10]

  beforeEach(async () => {
    tradeHistoryTest = await TestTradeHistory.new()
  })

  describe("Add", async() => {
    it("should return empty when there are no trades", async() => {
      const actualTrades = await tradeHistoryTest.getTrades(TIME_RANGE_DEFAULT, GET_TRADES_LIMIT_DEFAULT)
      const emptyTrades = [ [], [], [], [], [] ]
      assert.deepEqual(actualTrades, emptyTrades)
    })

    it("should append new trade to end of list", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: true, timestamp: 3}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      await checkTrades([trade3, trade2, trade1], TIME_RANGE_DEFAULT, GET_TRADES_LIMIT_DEFAULT)
    })

    it("should consolidate trades with same order id and price and timestamp", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 2, price: 2, amount: 3, isSell: true, timestamp: 2}
      const trade4 = {id: 2, price: 2, amount: 4, isSell: true, timestamp: 4}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade4.id, trade4.price, trade4.amount, trade4.isSell, trade4.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade4,
        {id: 2, price: 2, amount: 5, isSell: true, timestamp: 2},
        trade1
      ]
      await checkTrades(expectedTrades, TIME_RANGE_DEFAULT, GET_TRADES_LIMIT_DEFAULT)
    })
  })

  describe("GetTrades", async() => {
    it("should not exceed limit", async() => {
      const trade = {price: 1, amount: 1, isSell: false, timestamp: 1}

      await tradeHistoryTest.add(1, trade.price, trade.amount, trade.isSell, trade.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(2, trade.price, trade.amount, trade.isSell, trade.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(3, trade.price, trade.amount, trade.isSell, trade.timestamp).should.be.fulfilled

      const expectedTrades = [
        {id: 3, price: 1, amount: 1, isSell: false, timestamp: 1},
        {id: 2, price: 1, amount: 1, isSell: false, timestamp: 1}
      ]

      await checkTrades(expectedTrades, TIME_RANGE_DEFAULT, 2)
    })

    it("should return empty if startEnd is greater than endTime", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled

      const actualTrades = await tradeHistoryTest.getTrades([1,0], GET_TRADES_LIMIT_DEFAULT)
      const emptyTrades = [ [], [], [], [], [] ]
      assert.deepEqual(actualTrades, emptyTrades)
    })

    it("should return empty if startTime is equal to endTime", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled

      const actualTrades = await tradeHistoryTest.getTrades([1,1], GET_TRADES_LIMIT_DEFAULT)
      const emptyTrades = [ [], [], [], [], [] ]
      assert.deepEqual(actualTrades, emptyTrades)
    })

    it("should return all trades up to endTime when startTime == 0", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade2,
        trade1
      ]
      await checkTrades(expectedTrades, [0,2], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return all trades from startTime when endTime > latest", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade3,
        trade2,
        trade1
      ]
      await checkTrades(expectedTrades, [1,4], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return all trades within time range when endTime and startTime are found", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}
      const trade4 = {id: 4, price: 4, amount: 4, isSell: true, timestamp: 4}
      const trade5 = {id: 5, price: 5, amount: 5, isSell: true, timestamp: 5}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade4.id, trade4.price, trade4.amount, trade4.isSell, trade4.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade5.id, trade5.price, trade5.amount, trade5.isSell, trade5.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade4,
        trade3,
        trade2
      ]
      await checkTrades(expectedTrades, [2,4], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return all trades within time range when endTime and startTime are not found", async() => {
      const trade1 = {id: 1, price: 1, amount: 1, isSell: false, timestamp: 1}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}
      const trade4 = {id: 4, price: 4, amount: 4, isSell: true, timestamp: 4}
      const trade6 = {id: 6, price: 6, amount: 6, isSell: true, timestamp: 6}

      await tradeHistoryTest.add(trade1.id, trade1.price, trade1.amount, trade1.isSell, trade1.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade4.id, trade4.price, trade4.amount, trade4.isSell, trade4.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade6.id, trade6.price, trade6.amount, trade6.isSell, trade6.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade4,
        trade3
      ]
      await checkTrades(expectedTrades, [2,5], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return two trades", async() => {
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 2}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}

      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade3,
        trade2
      ]

      await checkTrades(expectedTrades, [1,4], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [1,3], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [2,4], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [2,3], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return two trades with the same timestamp", async() => {
      const trade2 = {id: 2, price: 2, amount: 2, isSell: true, timestamp: 3}
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}

      await tradeHistoryTest.add(trade2.id, trade2.price, trade2.amount, trade2.isSell, trade2.timestamp).should.be.fulfilled
      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade3,
        trade2
      ]

      await checkTrades(expectedTrades, [1,4], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [1,3], GET_TRADES_LIMIT_DEFAULT)
    })

    it("should return one trade", async() => {
      const trade3 = {id: 3, price: 3, amount: 3, isSell: false, timestamp: 3}

      await tradeHistoryTest.add(trade3.id, trade3.price, trade3.amount, trade3.isSell, trade3.timestamp).should.be.fulfilled

      const expectedTrades = [
        trade3
      ]

      await checkTrades(expectedTrades, [1,4], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [1,3], GET_TRADES_LIMIT_DEFAULT)
      await checkTrades(expectedTrades, [3,4], GET_TRADES_LIMIT_DEFAULT)
    })
  })

  async function checkTrades(expectedTrades, timeRange, limit) {
      const result = await tradeHistoryTest.getTrades(timeRange, limit)
      const actualTrades = parseTradeResult(result)
      assert.equal(actualTrades.id.length, expectedTrades.length, 'The number of trades is different')
      for (let i = 0; i < expectedTrades.length; i++) {
          assert.equal(actualTrades.id[i], expectedTrades[i].id, 'The id is different')
          assert.equal(actualTrades.price[i], expectedTrades[i].price, 'The price is different')
          assert.equal(actualTrades.amount[i], expectedTrades[i].amount, 'The amount is different')
          assert.equal(actualTrades.isSell[i], expectedTrades[i].isSell, 'The isSell is different')
          assert.equal(actualTrades.timestamp[i], expectedTrades[i].timestamp, 'The timestamp is different')
      }
  }

  function parseTradeResult(result) {
      return {
          id: result[0].map(t => t.toNumber()),
          price: result[1].map(t => t.toNumber()),
          amount: result[2].map(t => t.toNumber()),
          isSell: result[3],
          timestamp: result[4].map(t => t.toNumber())
      }
  }
})
