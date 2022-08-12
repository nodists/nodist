const AwaitSpawn = require('await-Spawn');

/**
 * オプション省略した
 * @returns {Promise}
 */
module.exports = {


  
  Spawn(){
    [].push.call(arguments,{
      shell: true,
      stdio: ['inherit', 'pipe', 'inherit']
    })
    return AwaitSpawn.apply(this,arguments)
  }
}