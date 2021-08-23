let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let answerSchema = new Schema({
    text: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    questionId: {type: Schema.Types.ObjectId, ref: "Question", required: true},
    upvote: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamps: true});
module.exports = mongoose.model("Answer", answerSchema);