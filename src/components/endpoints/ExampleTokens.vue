<script setup lang="ts">
// external dependencies
import { ref } from 'vue'
import { padLeft, toWei } from 'web3-utils'
import { Contract } from 'web3-eth-contract'
import { ERC725 } from '@erc725/erc725.js'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'

// composition and hooks
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import { getState } from '@/stores'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import { ContractStandard } from '@/enums'

const tokenType = ref<ContractStandard>(ContractStandard.LSP7)
const myToken = ref<Contract>()

const mintReceiver = ref<string>()

const tokenId = ref<string>(padLeft(1, 64))
const mintAmount = ref(100)

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const mint = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    switch (tokenType.value) {
      case ContractStandard.LSP7:
        myToken.value = contract(LSP7Mintable.abi as any, mintToken.value, {
          gas: DEFAULT_GAS,
          gasPrice: DEFAULT_GAS_PRICE,
        })

        await myToken.value.methods
          .mint(
            mintReceiver.value,
            toWei(mintAmount.value.toString()),
            false,
            '0x'
          )
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })
        break
      case ContractStandard.LSP8:
        if (!tokenId.value) {
          setNotification('Token ID needs to be filled', 'danger')
          return
        }

        myToken.value = contract(LSP8Mintable.abi as any, mintToken.value, {
          gas: DEFAULT_GAS,
          gasPrice: DEFAULT_GAS_PRICE,
        })

        await myToken.value.methods
          .mint(mintReceiver.value, tokenId.value, false, '0x')
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })

        const metadataKey = ERC725.encodeKeyName(
          'LSP8MetadataJSON:<bytes32>',
          tokenId.value
        )
        await myToken.value.methods
          .setData(metadataKey, metadataJsonUrl)
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })
        break
      default:
        console.log('Standard not supported')
    }

    setNotification('Token minted', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">
        Example Tokens (LSP7) & NFTs (LSP8)
      </p>
      <p>
        The Token contracts listed below allow you to mint free LSP7 tokens and
        LSP8 NFTs on LUKSO Testnet (for yourself or any other address!)
      </p>
      <p class="mt-2">Use these tokens for testing purposes.</p>

      <div class="field mt-5">
        <p class="is-size-4">🪙 LSP7 Token</p>

        <div class="control mt-2">
          <div class="field">
            <div class="select is-fullwidth">
              <select>
                <option value="">Empty</option>
                <optgroup>
                  <option value="0xcafecafecafecafecafecafecafecafecafecafe">
                    0xcafecafecafecafecafecafecafecafecafecafe
                  </option>
                  <option value="0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef">
                    0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
          <label class="label">Address to mint for</label>
          <input
            v-model="mintReceiver"
            class="input is-family-code"
            type="text"
            data-testid="mint-address"
          />
          <label class="label">Amount to mint</label>
          <input
            v-model="mintAmount"
            class="input"
            type="number"
            placeholder="0"
          />
        </div>
        <div class="field mt-3">
          <button
            class="button is-primary is-rounded mb-3 mr-3"
            data-testid="mint"
            @click="mint"
          >
            Mint tokens
          </button>
        </div>
      </div>

      <div class="field">
        <p class="is-size-4">🎨 LSP8 NFT</p>

        <div class="control mt-2">
          <div class="field">
            <div class="select is-fullwidth">
              <select>
                <option value="">Empty</option>
                <optgroup>
                  <option value="0xcafecafecafecafecafecafecafecafecafecafe">
                    0xcafecafecafecafecafecafecafecafecafecafe
                  </option>
                  <option value="0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef">
                    0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
          <label class="label">Address to mint for</label>
          <input
            v-model="mintReceiver"
            class="input is-family-code"
            type="text"
            data-testid="mint-address"
          />
          <label class="label">Token ID to mint</label>
          <input v-model="tokenId" class="input" type="text" />
        </div>
        <div class="field mt-3">
          <button
            class="button is-primary is-rounded mb-3 mr-3"
            data-testid="mint"
            @click="mint"
          >
            Mint NFT
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
