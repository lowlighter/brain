//Dependancies
  const { spawnSync, spawn } = require('child_process')
  const path = require('path')
  const fs = require('fs')
  const ls = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

//Ignored folders
  const ignored = [".git", "miscelleanous"]

//Verifying installation
  process.stdout.write('\x1Bc')
  console.log("Checking installed modules :")
  ls(".").filter(f => ignored.indexOf(f) < 0).forEach(f => {
    //Initialization
      const cwd = path.join(__dirname, f)
      const name = `${f.charAt(0).toLocaleUpperCase()}${f.slice(1)}`
    //Checking modules and install them
      process.stdout.write(`    \x1b[33m${name}\x1b[0m`)
      if (((!fs.existsSync(path.join(cwd, "node_modules")))&&(fs.existsSync(path.join(cwd, "package.json"))))) {
        process.stdout.write(` \x1b[33m(installing)\x1b[0m`)
        spawnSync("npm", ["install"], {cwd, shell:true})
      }
      process.stdout.write(`\r    \x1b[32m${name}\x1b[0m${" ".repeat(14)}\n`)
  })

//Start server
  console.log("\nStarting server...")
  spawn("npm", ["start"], {cwd:path.join(__dirname, "alayer"), shell:true, stdio:[0, 1, 2]})
  spawn("node", ["logs.js"], {cwd:path.join(__dirname, "alayer"), shell:true, detached:true, stdio:[0, 1, 2]})
