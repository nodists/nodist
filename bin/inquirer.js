const Chalk     = require('Chalk')
const Table     = require('cli-table');
const Cursor    = require('cli-cursor')
const Base      = require('inquirer/lib/Prompts/base')
const Events    = require('inquirer/lib/utils/events')
const Choices   = require('inquirer/lib/objects/choices')

class TableBase extends Base {

 /**
  * handle
  */
  onUpKey() {
    this.line = this.line > 0 ? this.line - 1 : this.line
    this.render()
  }
  onDownKey() {
    this.line = this.line < (this.rows.realLength - 1) ? this.line + 1 : this.line
    this.render()
  }
  onLeftKey(){
    this.line = (this.line - this.page) > 0 ? this.line - (this.page + 1) : 0
    this.render()
  }
  onRightKey() {
    this.line = (this.line + this.page) < this.rows.realLength ? this.line + (this.page - 1) : this.line = (this.rows.realLength - 1)
    this.render()
  }
  paginate() {
    const middle = Math.floor(this.page / 2)
    const begin  = Math.max(0, this.line - middle)
    const end    = Math.min(begin + this.page - 1,this.rows.realLength - 1)
    return [
      Math.max(0, begin - (this.page - 1 - end + begin)),
      end
    ]
  }

/**
 * handle pressed enter key
 */
 onEnter(state) {
  Cursor.show()
  this.render()
  this.screen.done()
  this.status = 'answered'
  this.done(
    this.rows.get(this.line)
  )
}

 /**
  * initialise the Base
  *
  * @param  {Object} questions
  * @param  {Object} rl
  * @param  {Object} answers
  */
   constructor(questions, rl, answers) {

     Cursor.hide()
    
     super(questions, rl, answers)

     this.values = {}

     this.events = Events(this.rl)
     this.cols   = ['version','npm','v8','uv','zlib','openssl','modules','lts','security','installed']
     this.rows   = new Choices(this.opt.rows, [])
     this.page   = this.opt.line || 10
     this.line   = 0
   }

 /**
  * start the inquiry session
  * @param  {Function} callback when Base is done
  * @return {this}
  */
  _run(callback) {

    this.events.line
      .forEach(this.onEnter.bind(this))
    this.events.normalizedUpKey
      .forEach(this.onUpKey.bind(this))
    this.events.normalizedDownKey
      .forEach(this.onDownKey.bind(this))
    this.events.keypress.forEach(({ key }) => {
      switch(key.name){
        case 'left':
          this.onLeftKey();
          break
        case 'right':
          this.onRightKey();
          break
      }
    })

    this.done = callback
    this.render()

    return this
  }

 /**
  * render the Base to screen
  * @return {Base} self
  */
  render(error) {
    
    const [begin, end] = this.paginate()
    const pagination = `${begin + 1}-${end + 1} of ${this.rows.realLength}`
    const table = new Table({head:[Chalk.reset(pagination)].concat(this.cols.map(name => Chalk.reset(name)))})

    this.rows.forEach((rowData,rowLine) => {

      if (rowLine >= begin && rowLine <= end){

        var style = (this.status !== 'answered' && this.line === rowLine)
          ? Chalk.reset.blue.bold 
          : Chalk.reset

        var highlight = (v,b)=>{
          return b ? Chalk.reset.green.bold(v) : v
        }

        var row = {
          [style(rowData.date)]:[
            rowData.version  || '',
            rowData.npm      || '',
            rowData.v8       || '',
            rowData.uv       || '',
            rowData.zlib     || '',
            rowData.openssel || '',
            rowData.modules  || '',
            rowData.lts      || '',
            rowData.security  ? 'YES' : '',
            rowData.installed ? 'YES' : ''
          ].map(v=>style(v))
            
        }
        table.push(
          row
        )
      }
    })

    this.screen.render(
      [
         ' Press ',
         Chalk.cyan.bold("<enter>"),
         ' to select ',
         Chalk.cyan.bold("<Up and Down>"),
         ' to move rows ',
         Chalk.cyan.bold("<Left and Right>"),
         ' to move pages ',
         Chalk.cyan.bold("<CTRL + C>"),
         ' to exit prompt ',
         '\n',
         table.toString()
      ].join('')
    )

  }
}

module.exports =TableBase