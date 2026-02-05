//@ts-nocheck

import './style.css';

let myData = [];
/***************************************************/
/********* LÄGG TILL INKOMST OCH UTGIFT ************/
/***************************************************/
const addIncomeBtn = document.querySelector('#addIncomeBtn')
addIncomeBtn?.addEventListener('click', 'kaydown', checkInputConfirm);
const ENTER_KEY = 13;

function checkInputConfirm(e) {
  if (e.keyCod !== ENTER_KEY) {
    return;
  }

  myData.push({
    text: input.value,
  })
}


/***************************************************/
/**************** SUMMERA INKOMST ******************/
/***************************************************/




/***************************************************/
/***************** SUMMERA UTGIFT ******************/
/***************************************************/




/***************************************************/
/*********** SUMMERA INKOMST OCH UTGIFT ************/
/***************************************************/