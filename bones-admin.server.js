var fs = require('fs'),
    Bones = require('bones');

// Load AuthView template into Bones templates.
Bones.templates['Admin'] = Bones.templates['Admin'] ||
    fs.readFileSync(__dirname + '/Admin.hbs', 'utf-8');

// Pass through require of bones-admin.
module.exports = require('./bones-admin');

