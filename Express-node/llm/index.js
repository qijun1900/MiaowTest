/**
 * llm ??????
 */
const { chat } = require('./chains/conversational/chat');

module.exports = {
  chat,
  
  // ?????????
  // chatWithContext: require('./chains/conversational/chatWithContext'),
  // generateQuestion: ...
};