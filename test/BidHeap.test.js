const TestBidHeap = artifacts.require("TestBidHeap")

contract('BidHeap',  async(accounts) => {
  let heap;
  const EMPTY_NODE = {id: 0, owner: 0, baseToken: 0, tradeToken: 0, price: 0, amount: 0, timestamp: 0}

  beforeEach(async () => {
    heap = await TestBidHeap.new()
  })

  describe("insert", async() => {
    it("should init heap with empty node at index 0", async() => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)

      const result = await heap.getByIndex.call(0)
      assertNodeEqual(result, EMPTY_NODE)
    })

    it("should insert keys in max-heap-like fashion", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[2])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[0])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[1])
    })

    it("should handle equal price values", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 1, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 2, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[2])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[1])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[0])
    })

    it("should order nodes by id (FIFO) when price values are equal", async () => {
      const nodes = [
        {id: 3, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 1, amount: 0, timestamp: 0},
        {id: 1, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 1, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[2])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[0])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[1])
    })
  })

  describe("pop", async() => {
    it("should return empty node if heap is empty", async() => {
      const result = await heap.pop.call()
      assertNodeEqual(result, EMPTY_NODE)
    })

    it("should remove node if heap has single node", async() => {
      const nodes = [{id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 2, timestamp: 3}]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)

      const sizeAfterAdd = await heap.size.call()
      assert.equal(sizeAfterAdd.toNumber(), 1)

      const result = await heap.pop.call()
      assertNodeEqual(result, nodes[0])
      await heap.pop()

      const sizeAfterPop = await heap.size.call()
      assert.equal(sizeAfterPop.toNumber(), 0)
    })

    it("should remove max key nodes from heap", async() => {
      const nodes = [
        {id: 1, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 1, amount: 0, timestamp: 1},
        {id: 2, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 10, amount: 0, timestamp: 1},
        {id: 3, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 100, amount: 0, timestamp: 0},
        {id: 4, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 100, amount: 0, timestamp: 1}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)
      await heap.add(nodes[3].id, nodes[3].owner, nodes[3].baseToken, nodes[3].tradeToken, nodes[3].price, nodes[3].amount, nodes[3].timestamp)

      const sizeAfterAdd = await heap.size.call()
      assert.equal(sizeAfterAdd.toNumber(), 4)

      let result = await heap.pop.call()
      assertNodeEqual(result, nodes[2])
      await heap.pop()

      result = await heap.pop.call()
      assertNodeEqual(result, nodes[3])
      await heap.pop()

      result = await heap.pop.call()
      assertNodeEqual(result, nodes[1])
      await heap.pop()

      result = await heap.pop.call()
      assertNodeEqual(result, nodes[0])
      await heap.pop()

      const sizeAfterPop = await heap.size.call()
      assert.equal(sizeAfterPop.toNumber(), 0)
    })

    it("should remove max key nodes from heap with equal prices", async() => {
      const nodes = [
        {id: 1, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 1, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[1], baseToken: accounts[1], tradeToken: accounts[1], price: 1, amount: 0, timestamp: 0},
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      let result = await heap.pop.call()
      assertNodeEqual(result, nodes[0])
      await heap.pop()

      result = await heap.pop.call()
      assertNodeEqual(result, nodes[1])
      await heap.pop()

      result = await heap.pop.call()
      assertNodeEqual(result, nodes[2])
      await heap.pop()
    })
  })

  describe("updateOrder", async() => {
    it("should maintain max heap order after price increase update", async() => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      nodes[0].price = 101
      await heap.updatePriceById(1, nodes[0].price)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[0])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[2])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[1])
    })

    it("should maintain max heap order after price decrease update", async() => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      nodes[2].price = 5
      await heap.updatePriceById(3, nodes[2].price)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[1])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[0])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[2])
    })

    it("should do nothing is newPrice is same", async() => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      await heap.updatePriceById(1, nodes[0].price)
      await heap.updatePriceById(2, nodes[1].price)
      await heap.updatePriceById(3, nodes[2].price)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[2])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[0])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[1])
    })

    it("should update amount", async() => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)

      const newAmount = 10
      await heap.updateAmountById(1, newAmount)

      const updatedNode = await heap.getById.call(1)
      assert.equal(updatedNode[5], newAmount)
    })
  })

  describe("removeById", async() => {
    it("should extract node by unique id", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      await heap.removeById(2)

      const result = await heap.getById.call(2)
      assertNodeEqual(result, EMPTY_NODE)
    })

    it("should not remove if order not found", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 0, timestamp: 0},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 0, timestamp: 0},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 0, timestamp: 0}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const nonExistingId = 4
      await heap.removeById(4)

      const root = await heap.getByIndex.call(1)
      assertNodeEqual(root, nodes[2])

      const leftChild = await heap.getByIndex.call(2)
      assertNodeEqual(leftChild, nodes[0])

      const rightChild = await heap.getByIndex.call(3)
      assertNodeEqual(rightChild, nodes[1])
    })
  })

  describe("peak", async() => {
    it("should return root of heap", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 200, timestamp: 300}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const result = await heap.peak.call()
      assertNodeEqual(result, nodes[2])
    })
  })

  describe("getById", async() => {
    it("should find node by unique id", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 1, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 100, amount: 200, timestamp: 300}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const result = await heap.getById.call(2)
      assertNodeEqual(result, nodes[1])
    })
  })

  describe("getOrders", async() => {
    it("should get all orders", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 100, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 1, amount: 200, timestamp: 300}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const expectedOrders = [
        {id: 1, owner: accounts[0], price: 100, originalAmount: 2, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], price: 10, originalAmount: 20, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], price: 1, originalAmount: 200, amount: 200, timestamp: 300}
      ]
      const limit = 10
      await checkOrders(expectedOrders, limit)
    })

    it("should not exceed get limit", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 100, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 10, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 1, amount: 200, timestamp: 300}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)

      const expectedOrders = [
        {id: 1, owner: accounts[0], price: 100, originalAmount: 2, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], price: 10, originalAmount: 20, amount: 20, timestamp: 30}
      ]
      const limit = 2
      await checkOrders(expectedOrders, limit)
    })
  })

  describe("getAggregatedOrders", async() => {
    it("should get all orders aggregated by price", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 100, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 100, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 10, amount: 200, timestamp: 300},
        {id: 4, owner: accounts[9], baseToken: accounts[8], tradeToken: accounts[7], price: 1, amount: 2000, timestamp: 3000}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)
      await heap.add(nodes[3].id, nodes[3].owner, nodes[3].baseToken, nodes[3].tradeToken, nodes[3].price, nodes[3].amount, nodes[3].timestamp)

      const expectedOrders = [
        {price: 100, amount: 22},
        {price: 10, amount: 200},
        {price: 1, amount: 2000},
        {price: 0, amount: 0}
      ]
      const limit = 10
      await checkAggregatedOrders(expectedOrders, limit)
    })

    it("should get aggregated orders by price within limit", async () => {
      const nodes = [
        {id: 1, owner: accounts[0], baseToken: accounts[1], tradeToken: accounts[2], price: 100, amount: 2, timestamp: 3},
        {id: 2, owner: accounts[3], baseToken: accounts[4], tradeToken: accounts[5], price: 100, amount: 20, timestamp: 30},
        {id: 3, owner: accounts[6], baseToken: accounts[7], tradeToken: accounts[8], price: 10, amount: 200, timestamp: 300},
        {id: 4, owner: accounts[9], baseToken: accounts[8], tradeToken: accounts[7], price: 1, amount: 2000, timestamp: 3000}
      ]

      await heap.add(nodes[0].id, nodes[0].owner, nodes[0].baseToken, nodes[0].tradeToken, nodes[0].price, nodes[0].amount, nodes[0].timestamp)
      await heap.add(nodes[1].id, nodes[1].owner, nodes[1].baseToken, nodes[1].tradeToken, nodes[1].price, nodes[1].amount, nodes[1].timestamp)
      await heap.add(nodes[2].id, nodes[2].owner, nodes[2].baseToken, nodes[2].tradeToken, nodes[2].price, nodes[2].amount, nodes[2].timestamp)
      await heap.add(nodes[3].id, nodes[3].owner, nodes[3].baseToken, nodes[3].tradeToken, nodes[3].price, nodes[3].amount, nodes[3].timestamp)

      const expectedOrders = [
        {price: 100, amount: 22},
        {price: 10, amount: 200}
      ]
      const limit = 2
      await checkAggregatedOrders(expectedOrders, limit)
    })
  })

  async function checkOrders(expectedOrders, limit) {
      const result = await heap.getOrders(limit)
      const actualOrders = parseOrderResult(result)
      assert.equal(actualOrders.id.length, expectedOrders.length)
      for (let i = 0; i < expectedOrders.length; i++) {
          assert.equal(actualOrders.id[i], expectedOrders[i].id)
          assert.equal(actualOrders.owner[i], expectedOrders[i].owner)
          assert.equal(actualOrders.price[i], expectedOrders[i].price)
          assert.equal(actualOrders.originalAmount[i], expectedOrders[i].originalAmount)
          assert.equal(actualOrders.amount[i], expectedOrders[i].amount)
          assert.equal(actualOrders.timestamp[i], expectedOrders[i].timestamp)
      }
  }

  async function checkAggregatedOrders(expectedOrders, limit) {
      const result = await heap.getAggregatedOrders(limit)
      const actualOrders = parseAggregatedOrderResult(result)
      assert.equal(actualOrders.price.length, expectedOrders.length)
      for (let i = 0; i < expectedOrders.length; i++) {
          assert.equal(actualOrders.price[i], expectedOrders[i].price)
          assert.equal(actualOrders.amount[i], expectedOrders[i].amount)
      }
  }

  function parseOrderResult(result) {
      return {
          id: result[0].map(t => t.toNumber()),
          owner: result[1],
          price: result[2].map(t => t.toNumber()),
          originalAmount: result[3].map(t => t.toNumber()),
          amount: result[4].map(t => t.toNumber()),
          timestamp: result[5].map(t => t.toNumber())
      }
  }

  function parseAggregatedOrderResult(result) {
      return {
          price: result[0].map(t => t.toNumber()),
          amount: result[1].map(t => t.toNumber())
      }
  }

  function assertNodeEqual(actualNode, expectedNode) {
    assert.equal(actualNode[0].toNumber(), expectedNode.id)
    assert.equal(actualNode[1], expectedNode.owner)
    assert.equal(actualNode[2], expectedNode.baseToken)
    assert.equal(actualNode[3], expectedNode.tradeToken)
    assert.equal(actualNode[4].toNumber(), expectedNode.price)
    assert.equal(actualNode[5].toNumber(), expectedNode.amount)
    assert.equal(actualNode[6].toNumber(), expectedNode.timestamp)
  }
})
