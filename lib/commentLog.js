class Comment {
  constructor(name, comment, time) {
    this.name = name;
    this.comment = comment;
    this.time = time;
  }

  toHTML() {
    return `<tr>
             <td> ${this.time.toDateString()} </td>
             <td> ${this.time.toLocaleTimeString()} </td>
             <td> ${this.name} </td>
             <td> ${this.comment} </td>
    </tr>`;
  }
}

class CommentLog {
  constructor() {
    this.comments = [];
  }

  addComment(comment) {
    this.comments.unshift(comment);
  }

  toHTML() {
    return this.comments.map(comment => comment.toHTML()).join('');
  }

  static load(content) {
    const commentList = JSON.parse(content || '[]');
    const comments = new CommentLog();
    commentList.forEach(comment => {
      comments.addComment(
        new Comment(comment.name, comment.comment, new Date(comment.time))
      );
    });
    return comments;
  }

  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { CommentLog, Comment };
