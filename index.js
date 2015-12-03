var state = require('state.js');

// uncomment this to see internal state.js changes
//state.console = console;
var logContextEnabled = false; // on off our own context logging

var emailCollectorModel = new state.StateMachine('model');

// our bag of state, used to determine when to transition
var context = {
  message: "",
  hasTextInput: false,
  timeSinceMessage: 0
};
var intervalId; // so we can exit our state check loop

var instance = new state.StateMachineInstance("instance");

var evaluateState = function() {
  state.evaluate(emailCollectorModel, instance, context);
};


// define our different states
var initial = new state.PseudoState('initial', emailCollectorModel, state.PseudoStateKind.Initial);
var waitingToDeliverBotMessage = new state.State("waitingToDeliverBotMessage", emailCollectorModel);
var deliverBotWelcomeMessage = new state.State("deliverBotWelcomeMessage", emailCollectorModel);
var deliverBotEmailRequest = new state.State("deliverBotEmailRequest", emailCollectorModel);
var finalState = new state.FinalState('exit', emailCollectorModel, state.PseudoStateKind.Terminate);

// define state entry actions
// these can be an array of actions
waitingToDeliverBotMessage.entry(() => { 
  console.log('===========')
  console.log('waiting to deliver bot message') 
  console.log('===========')
});

deliverBotWelcomeMessage.entry(() => { 
  console.log('===========')
  console.log('bot message'); 
  console.log('===========')
});

deliverBotEmailRequest.entry(() => { 
  console.log('===========')
  console.log('bot email request'); 
  console.log('===========')
});


// define transitions between states
emailCollectorModel.to(finalState).when(context => { 
  logContext('to finalState', context);
  return context.message === "exit";
});

waitingToDeliverBotMessage.to(deliverBotWelcomeMessage).when(context => { 
  logContext('to deliverBotWelcomeMessage', context);
  return context.message === "new_user_message" && context.timeSinceMessage >=4;
});

deliverBotWelcomeMessage.to(deliverBotEmailRequest).when(context => { 
  logContext('to deliverBotEmailRequest', context);
  return context.message === "bot_message_delivered" && context.timeSinceMessage >=1;
});

finalState.entry(() => {
  console.log('===========')
  console.log('exit'); 
  console.log('===========')
  clearInterval(intervalId);
});

// logger
var logContext = (source, context) => {
  if (logContextEnabled === false) return;
  console.log('------------------------');
  console.log(`source: ${source}`);
  console.log(`
    message: ${context.message},
    timeSinceMessage: ${context.timeSinceMessage}`);
  console.log('------------------------');
};

initial.to(waitingToDeliverBotMessage);

state.initialise(emailCollectorModel, instance);

intervalId = setInterval(() => {
  evaluateState();
}, 401);

// these are examples to simulate async context updates from the IAM
setTimeout(() => {
  context.message = "new_user_message";
  context.timeSinceMessage = 4;
}, 400);

setTimeout(() => {
  context.message = "bot_message_delivered";
  context.timeSinceMessage = 1;
}, 800);

setTimeout(() => {
  context.message = "exit";
}, 1200);
