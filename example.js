ini = require('./index.js')
data = ini.read('test/example.ini');

ini.write('test/out.ini', data);
