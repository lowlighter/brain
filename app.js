//Dependancies
  const { spawnSync, spawn } = require('child_process')
  const path = require('path')
  const fs = require('fs')
  const ls = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

//Ignored folders
  const ignored = [".git", "miscelleanous", "node_modules"]

//Verifying installation
  ;(function installation(){
    process.stdout.write('\x1Bc\n')
    const a = ls(".").filter(f => ignored.indexOf(f) < 0)

    process.stdout.write(`\r  ${"Modules availables".padEnd(18, " ")} │ ${a.length}\n`)
    process.stdout.write(`\r  ${" ".padEnd(18, " ")} │ \n`)

    for (let i = 0; i < a.length; i++) {
      //Initialization
        let f = a[i]
        const cwd = path.join(__dirname, f)
        const name = `${f.charAt(0).toLocaleUpperCase()}${f.slice(1)}`
      //Checking modules and install them
        process.stdout.write(`  ${name.padEnd(18, " ")} │ checking`)
        if (((!fs.existsSync(path.join(cwd, "node_modules")))&&(fs.existsSync(path.join(cwd, "package.json"))))) {
          process.stdout.write(`\r  ${name.padEnd(18, " ")} │ \x1b[33minstalling\x1b[0m\n`)
          spawnSync("npm", ["install"], {cwd, shell:true, stdio:[0, 1, 2]})
          return installation()
        }
        process.stdout.write(`\r  ${name.padEnd(18, " ")} │ \x1b[32minstalled    \x1b[0m\n`)
    }
  })()

//Start server
  process.stdout.write(`\r  ${" ".padEnd(18, " ")} │ \n`)
  process.stdout.write(`\r  ${"Server status".padEnd(18, " ")} │ \x1b[33mstarting\x1b[0m\n`)
  spawn("npm", ["start", ...process.argv.slice(2)], {cwd:path.join(__dirname, "alayer"), shell:true, stdio:[0, 1, 2]})
