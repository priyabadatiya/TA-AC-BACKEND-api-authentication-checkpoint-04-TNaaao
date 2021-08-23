let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let commentSchema = new Schema({
    text: {type: String, required: true},
    questionId: {type: Schema.Types.ObjectId, ref: "Question"},
    answerId: {type: Schema.Types.ObjectId, ref: "Answer"},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});
module.exports = mongoose.model("Comment", commentSchema);