import { Request, Response } from 'express';

export default {
  'POST /api/upload': (req: Request, res: Response) => {
    // 模拟文件上传成功
    const mockImageUrl = 'https://via.placeholder.com/300x200/1763a6/ffffff?text=活动图片';
    
    res.json({
      code: 0,
      url: mockImageUrl,
      msg: '上传成功'
    });
  },
}; 