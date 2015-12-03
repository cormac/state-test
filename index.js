var state = require('state.js');

// uncomment this to see internal state.js changes
//state.console = console;

var emailCollectorModel = new state.StateMachine('model');
var initial = new state.PseudoState('initial', emailCollectorModel, state.PseudoStateKind.Initial);
var finalState = new state.FinalState('exit', emailCollectorModel, state.PseudoStateKind.Terminate);

// our bag of state, used to determine when to transition
var context = {
  message: "",
  hasTextInput: false,
  timeSinceMessage: 0
};

var instance = new state.StateMachineInstance("instance");

var intervalId;

var evaluateState = function() {
  state.evaluate(emailCollectorModel, instance, context);
};

var logContext = (source, context) => {
  console.log('------------------------');
  console.log(`source: ${source}`);
  console.log(`
    message: ${context.message},
    timeSinceMessage: ${context.timeSinceMessage}`);
  console.log('------------------------');
};


var waitingToDeliverBotMessage = new state.State("waitingToDeliverBotMessage", emailCollectorModel);
var deliverBotWelcomeMessage = new state.State("deliverBotWelcomeMessage", emailCollectorModel);
var deliverBotEmailRequest = new state.State("deliverBotEmailRequest", emailCollectorModel);

// define state entry actions
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


// define transitions
waitingToDeliverBotMessage.to(deliverBotWelcomeMessage).when(context => { 
  logContext('to deliverBotWelcomeMessage', context);
  return context.message === "new_user_message" && context.timeSinceMessage >=4;
});

deliverBotWelcomeMessage.to(deliverBotEmailRequest).when(context => { 
  logContext('to deliverBotEmailRequest', context);
  return context.message === "bot_message_delivered" && context.timeSinceMessage >=1;
});

emailCollectorModel.to(finalState).when(context => { 
  logContext('to finalState', context);
  return context.message === "exit";
})


finalState.entry(() => {
  clearInterval(intervalId);
});

initial.to(waitingToDeliverBotMessage);

state.initialise(emailCollectorModel, instance);

intervalId = setInterval(() => {
  evaluateState();
}, 500);


// these would be set in response to events triggered within the IAM
setTimeout(() => {
  context.message = "new_user_message";
  context.timeSinceMessage = 4;
}, 400);


setTimeout(() => {
  context.message = "new_user_message";
  context.timeSinceMessage = 4;
}, 800);

setTimeout(() => {
  context.message = "bot_message_delivered";
  context.timeSinceMessage = 1;
}, 1200);

setTimeout(() => {
  context.message = "exit";
}, 1600);
