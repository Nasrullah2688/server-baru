import bcrypt from 'bcrypt';

export const hashPassword = (password: string): string => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};