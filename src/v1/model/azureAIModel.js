/*
Creator:            Supawit N.
Creation date:      19/06/2023
*/

const { AzureOpenAI } = require('openai')
// const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity')

module.exports = {
  callAzureAI: async (model = '', version = '', message = '') => {
    const endpoint = 'https://ai-2024trainees57aieastus771482062596.openai.azure.com/'
    // const scope = `${endpoint}/.default`
    // const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope)

    const apiKey = 'edda951964f74b45a0f76824370dea16'
    const deployment = model
    const apiVersion = version
    console.log('============================')

    try {
      const client = new AzureOpenAI({
        endpoint,
        apiKey,
        deployment,
        apiVersion
      })

      let result = null
      const response = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an AI assistant that helps people find information.' },
          { role: 'user', content: message }
        ],
        model: model
      })

      if (response && response.choices && response.choices.length > 0) {
        result = response.choices[0]?.message?.content || null
      }

      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
