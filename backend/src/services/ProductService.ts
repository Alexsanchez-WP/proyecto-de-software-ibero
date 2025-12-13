import { Product, IProduct } from '../models/Product';
import { Subject, Observer } from '../utils/Observer';

export class ProductService implements Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }

  async getAll(): Promise<IProduct[]> {
    return await Product.find();
  }

  async getById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const newProduct = await Product.create(productData);
    this.notify({ event: 'PRODUCT_CREATED', product: newProduct });
    return newProduct;
  }

  async update(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
    if (updatedProduct) {
      this.notify({ event: 'PRODUCT_UPDATED', product: updatedProduct });
    }
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    const success = !!result;
    if (success) {
      this.notify({ event: 'PRODUCT_DELETED', productId: id });
    }
    return success;
  }
}
