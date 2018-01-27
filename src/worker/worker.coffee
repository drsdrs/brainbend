###
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

###

instructions = ""
instructionPointer = 0

defaultSize = 256

stack = new Uint8Array defaultSize*defaultSize
stackLength = defaultSize*defaultSize
pointer = 0
pointer2D = new Uint8Array 2

processing = false
tempRegister = new Uint8Array 1 # for temporary register as calculation

## should parse instructions before processing
incStackCell = ()-> stack[pointer]++
decStackCell = ()-> stack[pointer]--
getStackCell = ()-> stack[pointer]
setStackCell = (val)-> stack[pointer] = val

getTempRegister = ()-> tempRegister[0]
setTempRegister = (newVal)-> tempRegister[0] = newVal


alu = (operator)->
  if operator=="+" then setTempRegister getStackCell() + getTempRegister()
  else if operator=="-" then setTempRegister getStackCell() - getTempRegister()
  else if operator=="&" then setTempRegister getStackCell() & getTempRegister()
  else if operator=="^" then setTempRegister getStackCell() ^ getTempRegister()
  else if operator=="|" then setTempRegister getStackCell() | getTempRegister()

resetStack = ()->
  i = stackLength
  while i-- then stack[i] = 0
  instructionPointer = 0
  pointer = 0
  pointer2D = [0, 0]

parseInstructions = (instrUnparsed)->
  parsedInst = ""
  lastInstr = ""
  loopStack = []

  checkLoop = ->
    if loopStack.length>0
      totalLoopLength = 1
      while loopStack.length
        totalLoopLength *= loopStack.pop()
      totalLoopLength--
      if totalLoopLength>stackLength then totalLoopLength = stackLength
      while totalLoopLength--
        parsedInst += lastInstr||""

  for i in instrUnparsed
    if isNaN(i) ## NOT Number
      checkLoop()
      parsedInst += i
      lastInstr = i
    else # NUMBER !!!
      loopStack.push(i) if i != 0

  checkLoop()
  resetStack()
  instructions = parsedInst

process = (i)-> # i=instruction
  if(i=="w"||i=="a"||i=="s"||i=="d") then setPointer i
  else if(i=="+"||i=="-"||i=="^"||i=="&"||i=="|") then alu i
  else if(i=="r") then incStackCell()
  else if(i=="f") then decStackCell()
  else if(i=="x") then pointer2D[0] = getTempRegister()
  else if(i=="y") then pointer2D[1] = getTempRegister()
  else if(i=="c") then setStackCell getTempRegister()
  else if(i=="v") then setTempRegister getStackCell()

processInstructionSet = ->
  if processing==true then return #throw 666
  tempInstr = instructions
  instrLen = tempInstr.length
  return if instrLen==0
  len = stackLength/18
  processing = true
  x = 0
  while (x++)<len
    if instructionPointer == instrLen then instructionPointer = 0
    process tempInstr[instructionPointer]
    instructionPointer++

  processing = false

setPointer = (dir)->
  if dir=="w"
    if(pointer2D[1]==0) then pointer2D[1] = defaultSize-1 else pointer2D[1]--
  else if dir=="s"
    if(pointer2D[1]==defaultSize-1) then pointer2D[1] = 0 else pointer2D[1]++
  else if dir=="a"
    if(pointer2D[0]==0) then pointer2D[0] = defaultSize-1 else pointer2D[0]--
  else if dir=="d"
    if(pointer2D[0]==defaultSize-1) then pointer2D[0] = 0 else pointer2D[0]++
  pointer = pointer2D[0]+(pointer2D[1]*defaultSize)


nextMsgType = ""
self.onmessage = (n) ->
  if nextMsgType == "getInstructions"
    nextMsgType = ""
    while processing==true then null#throw 6660666
    parseInstructions n.data
  if n.data == "S" # set instructions
    nextMsgType = "getInstructions"
  if n.data == 'G' # get imagedata
    self.postMessage stack
    processInstructionSet()
  return
