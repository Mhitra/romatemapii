const BlogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  catagories: {
    type: Array,
    required: false
  },
  comments: [{
    body: String,
    date: Date
  }],
  date: { 
    type: Date, 
    default: Date.now 
  },

  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});

export default model("Blog", BlogSchema);