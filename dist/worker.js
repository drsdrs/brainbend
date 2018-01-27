(function() {
  /*
    VM_INSTRUCTIONS
    --- STACK ---
    w = pointer up
    s = pointer down
    a = pointer left
    d = pointer right
    r = inc cell
    f = dec cell
    c = set cell to tempRegister
    v = set tempRegister to cell
    x = set pointerX to tempregisterValue
    y = set pointerY to tempregisterValue
    --- LOOP ---
    0-9 = repeat prev instruction, following numbers are multiplied
    --- MATH --- use operator on pointerValue and tempregister then copy result into tempregister
    + = add
    - = remove
    & = AND
    | = OR
    ^ = XOR

    TODO ????? use full numbers in loops and use :"instructions":234 to surround them

   */
  var alu, decStackCell, defaultSize, getStackCell, getTempRegister, incStackCell, instructionPointer, instructions, nextMsgType, parseInstructions, pointer, pointer2D, process, processInstructionSet, processing, resetStack, setPointer, setStackCell, setTempRegister, stack, stackLength, tempRegister;

  instructions = "";

  instructionPointer = 0;

  defaultSize = 256;

  stack = new Uint8Array(defaultSize * defaultSize);

  stackLength = defaultSize * defaultSize;

  pointer = 0;

  pointer2D = new Uint8Array(2);

  processing = false;

  tempRegister = new Uint8Array(1); // for temporary register as calculation

  
  //# should parse instructions before processing
  incStackCell = function() {
    return stack[pointer]++;
  };

  decStackCell = function() {
    return stack[pointer]--;
  };

  getStackCell = function() {
    return stack[pointer];
  };

  setStackCell = function(val) {
    return stack[pointer] = val;
  };

  getTempRegister = function() {
    return tempRegister[0];
  };

  setTempRegister = function(newVal) {
    return tempRegister[0] = newVal;
  };

  alu = function(operator) {
    if (operator === "+") {
      return setTempRegister(getStackCell() + getTempRegister());
    } else if (operator === "-") {
      return setTempRegister(getStackCell() - getTempRegister());
    } else if (operator === "&") {
      return setTempRegister(getStackCell() & getTempRegister());
    } else if (operator === "^") {
      return setTempRegister(getStackCell() ^ getTempRegister());
    } else if (operator === "|") {
      return setTempRegister(getStackCell() | getTempRegister());
    }
  };

  resetStack = function() {
    var i;
    i = stackLength;
    while (i--) {
      stack[i] = 0;
    }
    instructionPointer = 0;
    pointer = 0;
    return pointer2D = [0, 0];
  };

  parseInstructions = function(instrUnparsed) {
    var checkLoop, i, j, lastInstr, len1, loopStack, parsedInst;
    parsedInst = "";
    lastInstr = "";
    loopStack = [];
    checkLoop = function() {
      var results, totalLoopLength;
      if (loopStack.length > 0) {
        totalLoopLength = 1;
        while (loopStack.length) {
          totalLoopLength *= loopStack.pop();
        }
        totalLoopLength--;
        if (totalLoopLength > stackLength) {
          totalLoopLength = stackLength;
        }
        results = [];
        while (totalLoopLength--) {
          results.push(parsedInst += lastInstr || "");
        }
        return results;
      }
    };
    for (j = 0, len1 = instrUnparsed.length; j < len1; j++) {
      i = instrUnparsed[j];
      if (isNaN(i)) { //# NOT Number
        checkLoop();
        parsedInst += i;
        lastInstr = i; // NUMBER !!!
      } else {
        if (i !== 0) {
          loopStack.push(i);
        }
      }
    }
    checkLoop();
    resetStack();
    return instructions = parsedInst;
  };

  process = function(i) { // i=instruction
    if (i === "w" || i === "a" || i === "s" || i === "d") {
      return setPointer(i);
    } else if (i === "+" || i === "-" || i === "^" || i === "&" || i === "|") {
      return alu(i);
    } else if (i === "r") {
      return incStackCell();
    } else if (i === "f") {
      return decStackCell();
    } else if (i === "x") {
      return pointer2D[0] = getTempRegister();
    } else if (i === "y") {
      return pointer2D[1] = getTempRegister();
    } else if (i === "c") {
      return setStackCell(getTempRegister());
    } else if (i === "v") {
      return setTempRegister(getStackCell());
    }
  };

  processInstructionSet = function() {
    var instrLen, len, tempInstr, x;
    if (processing === true) { //throw 666
      return;
    }
    tempInstr = instructions;
    instrLen = tempInstr.length;
    if (instrLen === 0) {
      return;
    }
    len = stackLength / 18;
    processing = true;
    x = 0;
    while ((x++) < len) {
      if (instructionPointer === instrLen) {
        instructionPointer = 0;
      }
      process(tempInstr[instructionPointer]);
      instructionPointer++;
    }
    return processing = false;
  };

  setPointer = function(dir) {
    if (dir === "w") {
      if (pointer2D[1] === 0) {
        pointer2D[1] = defaultSize - 1;
      } else {
        pointer2D[1]--;
      }
    } else if (dir === "s") {
      if (pointer2D[1] === defaultSize - 1) {
        pointer2D[1] = 0;
      } else {
        pointer2D[1]++;
      }
    } else if (dir === "a") {
      if (pointer2D[0] === 0) {
        pointer2D[0] = defaultSize - 1;
      } else {
        pointer2D[0]--;
      }
    } else if (dir === "d") {
      if (pointer2D[0] === defaultSize - 1) {
        pointer2D[0] = 0;
      } else {
        pointer2D[0]++;
      }
    }
    return pointer = pointer2D[0] + (pointer2D[1] * defaultSize);
  };

  nextMsgType = "";

  self.onmessage = function(n) {
    if (nextMsgType === "getInstructions") {
      nextMsgType = "";
      while (processing === true) {
        null; //throw 6660666
      }
      parseInstructions(n.data);
    }
    if (n.data === "S") { // set instructions
      nextMsgType = "getInstructions";
    }
    if (n.data === 'G') { // get imagedata
      self.postMessage(stack);
      processInstructionSet();
    }
  };

}).call(this);
