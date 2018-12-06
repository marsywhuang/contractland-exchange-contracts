const TestOrderNode = artifacts.require("TestOrderNode")

contract('OrderNode',  async(accounts) => {
  let orderNodeTest;

  beforeEach(async () => {
    orderNodeTest = await TestOrderNode.new()
  })

  describe("isGreaterThan", async() => {
    it("A should be greater than B when price is greater", async() => {
      orderNodeTest.setNodeA(2, 1)
      orderNodeTest.setNodeB(1, 1)
      assert.isTrue(await orderNodeTest.AGreaterThanB())
    })
    
    it("A should not be greater than B when price is less", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(2, 1)
      assert.isFalse(await orderNodeTest.AGreaterThanB())
    })
    
    it("A should be greater than B when price is equal and id is older", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(1, 2)
      assert.isTrue(await orderNodeTest.AGreaterThanB())
    })
    
    it("A should not be greater than B when price is equal and id is newer", async() => {
      orderNodeTest.setNodeA(1, 2)
      orderNodeTest.setNodeB(1, 1)
      assert.isFalse(await orderNodeTest.AGreaterThanB())
    })
    
    it("A should not be greater than B when price and id are equal", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(1, 1)
      assert.isFalse(await orderNodeTest.AGreaterThanB())
    })
  })
  
  describe("isLessThan", async() => {
    it("A should be less than B when price is less", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(2, 1)
      assert.isTrue(await orderNodeTest.ALessThanB())
    })
    
    it("A should not be less than B when price is greater", async() => {
      orderNodeTest.setNodeA(2, 1)
      orderNodeTest.setNodeB(1, 1)
      assert.isFalse(await orderNodeTest.ALessThanB())
    })
    
    it("A should be less than B when price is equal and id is older", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(1, 2)
      assert.isTrue(await orderNodeTest.ALessThanB())
    })
    
    it("A should not be less than B when price is equal and id is newer", async() => {
      orderNodeTest.setNodeA(1, 2)
      orderNodeTest.setNodeB(1, 1)
      assert.isFalse(await orderNodeTest.ALessThanB())
    })
    
    it("A should not be less than B when price and id are equal", async() => {
      orderNodeTest.setNodeA(1, 1)
      orderNodeTest.setNodeB(1, 1)
      assert.isFalse(await orderNodeTest.ALessThanB())
    })
  })
})
