import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ApiResponseFactory } from '../utils/ApiResponseFactory';
import { LoggingObserver } from '../observers/LoggingObserver';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
    const loggingObserver = new LoggingObserver();
    this.productService.attach(loggingObserver);
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getAll();
      res.json(ApiResponseFactory.success(products));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.getById(req.params.id);
      if (product) {
        res.json(ApiResponseFactory.success(product));
      } else {
        res.status(404).json(ApiResponseFactory.error('Product not found'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const productData = { ...req.body };
      
      if ((req as any).files && (req as any).files.length > 0) {
        productData.images = (req as any).files.map((file: any) => `/uploads/${file.filename}`);
      } else {
        productData.images = [];
      }
      
      const product = await this.productService.create(productData);
      res.status(201).json(ApiResponseFactory.success(product, 'Product created successfully'));
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const updateData = { ...req.body };
      
      if ((req as any).files && (req as any).files.length > 0) {
        updateData.images = (req as any).files.map((file: any) => `/uploads/${file.filename}`);
      }

      const product = await this.productService.update(req.params.id, updateData);
      if (product) {
        res.json(ApiResponseFactory.success(product, 'Product updated successfully'));
      } else {
        res.status(404).json(ApiResponseFactory.error('Product not found'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const success = await this.productService.delete(req.params.id);
      if (success) {
        res.json(ApiResponseFactory.success(null, 'Product deleted successfully'));
      } else {
        res.status(404).json(ApiResponseFactory.error('Product not found'));
      }
    } catch (error: any) {
      res.status(500).json(ApiResponseFactory.error(error.message));
    }
  };
}
