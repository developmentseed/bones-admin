router = Bones.Router.extend({
    initialize: function() {
        this.server.get('/bones.admin.css', mirror.file(require, '../client/bones.admin.css'));
        this.server.get('/bones.admin.png', mirror.file(require, '../client/bones.admin.png'));
    }
});
