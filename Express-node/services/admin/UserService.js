const UserModel = require("../../models/UserModel");
const { deleteFile } = require("../../helpers/ossHelper");
const bcrypt = require("bcryptjs");

const BCRYPT_HASH_REGEXP = /^\$2[aby]\$\d{2}\$.{53}$/;

function isBcryptHash(value) {
  return typeof value === "string" && BCRYPT_HASH_REGEXP.test(value);
}

const UserService = {
  login: async ({ username, password }) => {
    // 先按用户名查找用户
    const users = await UserModel.find({ username });
    if (users.length === 0) return [];

    const user = users[0];
    if (!user.password) return [];

    let isMatch = false;
    if (isBcryptHash(user.password)) {
      // 新用户或已迁移用户：使用 bcrypt 校验
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // 兼容历史明文密码：校验通过后自动迁移为哈希
      isMatch = user.password === password;
      if (isMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });
        user.password = hashedPassword;
      }
    }

    if (!isMatch) return [];
    return users;
  },
  upload: async ({ _id, username, introduction, gender, avatar }) => {
    if (avatar) {
      // 删除旧头像
      const user = await UserModel.findById(_id);
      if (user && user.avatar) {
        await deleteFile(user.avatar);
      }
      return UserModel.updateOne(
        { _id },
        {
          username,
          introduction,
          gender,
          avatar,
        },
      );
    } else {
      return UserModel.updateOne(
        { _id },
        {
          username,
          introduction,
          gender,
        },
      );
    }
  },
  add: async ({
    username,
    introduction,
    gender,
    avatar,
    password,
    role,
    state,
    createTime,
  }) => {
    // 添加用户前对密码进行哈希加密，盐值为 10
    const hashedPassword = await bcrypt.hash(password, 10);
    return UserModel.create({
      username,
      password: hashedPassword,
      introduction,
      gender,
      avatar,
      role,
      state,
      createTime,
    });
  },
  // 根据用户名查找用户（用于注册时检查重复）
  findByUsername: async (username) => {
    return UserModel.findOne({ username });
  },
  // 修改getlist方法，添加分页
  getlist: async ({ id, page, size }) => {
    if (id) {
      return UserModel.find({ _id: id }, [
        "username",
        "introduction",
        "gender",
        "role",
        "password",
        "state",
        "createTime",
      ]);
    }
    // 分页查询
    const [data, total] = await Promise.all([
      UserModel.find({}, [
        "username",
        "introduction",
        "gender",
        "role",
        "avatar",
        "state",
        "createTime",
      ])
        .skip((page - 1) * size)
        .limit(Number(size)),
      UserModel.countDocuments({}),
    ]);

    return { data, total };
  },
  dellist: async ({ _id }) => {
    return UserModel.deleteOne({ _id });
  },
  putlist: async (body) => {
    const updatePayload = { ...body };

    if (typeof updatePayload.password === "string") {
      if (updatePayload.password.length === 0) {
        delete updatePayload.password;
      } else if (!isBcryptHash(updatePayload.password)) {
        updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
      }
    }

    return UserModel.updateOne({ _id: updatePayload._id }, updatePayload);
  },
  delManylist: async (body) => {
    return UserModel.deleteMany({ _id: { $in: body._ids } });
  },
  editUser: async ({
    _id,
    username,
    introduction,
    gender,
    role,
    state,
    avatar,
  }) => {
    if (avatar) {
      // 删除旧头像
      const user = await UserModel.findById(_id);
      if (user && user.avatar) {
        await deleteFile(user.avatar);
      }
      return UserModel.updateOne(
        { _id },
        {
          username,
          introduction,
          gender,
          role,
          state,
          avatar,
        },
      );
    } else {
      return UserModel.updateOne(
        { _id },
        {
          username,
          introduction,
          gender,
          role,
          state,
        },
      );
    }
  },
};

module.exports = UserService;
