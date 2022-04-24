const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should()

contract ('DecentralBank', ([owner, customer]) => {
    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before(async () => {
        // loading contract
        tether = await Tether.new()
        rwd = await RWD.new()
        //decentralBank = await DecentralBank.new(rwd, tether)
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        // transfer 1000000 tokens to DecentralBank
        await rwd.transfer(decentralBank.address, tokens('1000000'))

        // transfer 100 tether to account 1 from contract owner
        await tether.transfer(customer, tokens('100'), {from:  owner})
    })

    describe('Mock Tether Deployment', async () => {
        it('matches name successfully', async () => {
            //let tether = await Tether.new()
            const name = await tether.name()
            assert.equal(name, 'mock Tether')
        })
    })

    describe('Reward Deployment', async () => {
        it('matches name successfully', async () => {
            //let rwd = await RWD.new()
            const name = await rwd.name()
            assert.equal(name, 'reward Token')
        })
    })

    describe('DecentralBank Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await decentralBank.name()
            assert.equal(name, 'Decentral Bank')
        })
        it('bank has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance, tokens('1000000'))
        })
    })

    describe('Yield Farming', async () => {
        it('reward token for staking', async () => {
            let result
            // Check investor initial balance
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('100'), 'customer balance before staking')

            // customer approve transaction, then bank deposits
            await tether.approve(decentralBank.address, tokens('90'), {from: customer})
            await decentralBank.depositTokens(tokens('90'), {from: customer})

            // Check new balance
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('10'), 'customer balance after staking')

            stakingResult = await decentralBank.stakingBalance(customer)
            assert.equal(stakingResult.toString(), tokens('90'), 'customer staking balance')

            result = await decentralBank.isStaking(customer)
            assert.equal(result.toString(), 'true', 'customer is staking')

            result = await decentralBank.hasStaked(customer)
            assert.equal(result.toString(), 'true', 'customer has staked')

            // issue tokens
            await decentralBank.issueTokens({from: owner})
            await decentralBank.issueTokens({from: customer}).should.be.rejected;

            // unstake
            await decentralBank.unstakeTokens(tokens('30'), {from: customer})
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('40'), 'customer balance after usstaking')

        })
    })

})