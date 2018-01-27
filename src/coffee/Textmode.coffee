class Textmode
  constructor: (textEl)->
    @el = textEl
    @initScreen()
    @welcomeMsg()
    window.addEventListener 'keydown', @keydown
    window.addEventListener 'keypress', @keypress
    requestAnimationFrame @cycle
  SCREENSIZE: w:40, h:25
  time: 0 # count every animation frame
  cursor: x:0, y:0, blink:true
  keydown: (e)=>
    if e.keyCode==8 # BACKSPACE
      e.preventDefault()
      @delChar()
      return false
    if e.ctrlKey && e.shiftKey then @switchCaps()
    else if e.keyCode==37 then @checkCursor @cursor.x-1, null # LEFT ARROW
    else if e.keyCode==39 then @checkCursor @cursor.x+1, null # RIGHT ARROW
    else if e.keyCode==40 then @checkCursor null, @cursor.y+1 # TOP ARROW
    else if e.keyCode==38 then @checkCursor null, @cursor.y-1 # BOTTOM ARROW
  keypress: (e)=>
    if e.keyCode==13 then @getLine() # ENTER
    else if (e.keyCode||e.charCode)==32 then @putChar '&nbsp;' # SPACE
    else
      charCode = if e.keyCode==0 then e.charCode else e.keyCode
      @putChar String.fromCharCode charCode
  switchCaps: ->
    @el.className = if @el.className!='capsMode' then 'capsMode' else ''
  welcomeMsg: ->
    @checkCursor(0, 0)
    @writeDelayed '\n     **** saylermorph.com v0.1 ****\n\n 64k ram system 38911 basic bytes free\n\nready.\n'
  initScreen: ->
    for y in [0...@SCREENSIZE.h]
      rowEl = document.createElement 'ul'
      for x in [0...@SCREENSIZE.w]
        cellEl = document.createElement 'li'
        cellEl.innerHTML = '&nbsp;'
        rowEl.appendChild cellEl
      @el.appendChild rowEl

  checkCursor: (x,y)->
    @getCell().className = ''
    @cursor.x = x if x?
    @cursor.y = y if y?

    if @cursor.x==@SCREENSIZE.w
      @cursor.x = 0
      @cursor.y++
    else if @cursor.x==-1
      @cursor.x = @SCREENSIZE.w-1
      @cursor.y--

    if @cursor.y==@SCREENSIZE.h
      @cursor.y -= 1
      @shiftScreenUp()

    else if @cursor.y==-1
      @cursor.y = @SCREENSIZE.h-1

    @getCell().className = 'inverted'

  cmdInterpreter: (cmd)->
    interval = null
    if cmd.trim().length==0 then return true
    if cmd.split('clear').length>1
      @clearScreen()
    else if cmd.split('list').length>1
      @writeDelayed '0\n1\n2\n3\n4\n5\nready.\n'
    else if cmd.split('reset').length>1
      @clearScreen()
      @welcomeMsg()
    else if cmd.split('help').length>1
      @writeDelayed '\n\ncall 0900-drs-will-do-it\nready.\n'
    else if cmd.split('load').length>1
      @writeDelayed '\n\npress play on tape\nloading\nready.\n'
    else if cmd.split('run').length>1
      @clearScreen()
      @writeDelayed '
        1. A robot may not injure a human being\n   or, through inaction, allow a human
        \n   being to come to harm.
        \n\n2. A robot must obey the orders given
        \n   it by human beings except where such\n   orders would conflict with the First\n   Law.
        \n\n3. A robot must protect its own
        \n   existence as long as such protection\n   does not conflict with\n   the First or Second Laws
        \n\n\n\nready.\n'
    else @writeDelayed '\n?syntax error\nready.\n'
    return true


  getCell: ->
    @el.childNodes[@cursor.y].childNodes[@cursor.x]

  getLine: ->
    lineText = ''
    for child in @el.childNodes[@cursor.y].childNodes
      char = child.innerHTML
      lineText += if char=='&nbsp;' then ' ' else char
    if @cmdInterpreter lineText.toLowerCase() then @newLine()
    @checkCursor()

  blinkCursor: ->
    if @cursor.blink then @getCell().className = 'inverted'
    else @getCell().className = ''
    @cursor.blink = !@cursor.blink

  putChar: (char)->
    @checkCursor null, null
    @getCell().innerHTML = char
    @checkCursor @cursor.x+1, null

  delChar: ()->
    @checkCursor @cursor.x-1, null
    cell = @getCell()
    cell.innerHTML = '&nbsp;'

  newLine: ()=>
    @checkCursor 0, @cursor.y+1
    @getCell().className = 'inverted'

  clearScreen: ->
    @getCell().className = ''
    @cursor = x:0, y:0, blink:false
    for line in @el.childNodes
      for cell in line.childNodes
        cell.innerHTML = '&nbsp;'
    @getCell().className = 'inverted'

  setColor: ->  null # TODO ???

  shiftScreenUp: ->
    len = @el.childNodes
    for child, i in @el.childNodes
      if i==@el.childNodes.length-1
        for li in child.childNodes
          li.innerHTML = "&nbsp"
        return true
      replacement = @el.childNodes[i+1].innerHTML
      original = @el.childNodes[i]
      original.innerHTML = replacement

      #replacement.parentNode.replaceChild replacement, original


  textToWriteDelayed: ""

  writeDelayed: (text)-> @textToWriteDelayed += text

  nextDelayedText: ()->
    @write @textToWriteDelayed[0]
    @textToWriteDelayed = @textToWriteDelayed.substring 1, @textToWriteDelayed.length

  write: (text)-> # TODO implement \0 - \f \! codes \fore /background foreground and inverted
    for char in text
      if char=='\n' then @newLine()
      else
        @putChar if char==' ' then char = '&nbsp;' else char

  cycle: =>
    if (@time++)%35==0 then @blinkCursor()
    if (@time)%1==0 && @textToWriteDelayed.length>0 then @nextDelayedText()
    requestAnimationFrame @cycle
