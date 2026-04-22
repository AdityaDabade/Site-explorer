function buildSchemaOptions(extra = {}) {
  return {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id?.toString();

        if (ret.createdAt) {
          ret.created_at = new Date(ret.createdAt).toISOString();
        }

        if (ret.updatedAt) {
          ret.updated_at = new Date(ret.updatedAt).toISOString();
        }

        delete ret._id;
        delete ret.__v;
        delete ret.password;

        return ret;
      }
    },
    ...extra
  };
}

module.exports = {
  buildSchemaOptions
};
