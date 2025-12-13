import { ProductService } from '../../../src/services/ProductService';
import { Product } from '../../../src/models/Product';
import { Observer } from '../../../src/utils/Observer';

jest.mock('../../../src/models/Product');

describe('ProductService', () => {
  let productService: ProductService;
  let mockObserver: Observer;

  beforeEach(() => {
    productService = new ProductService();
    mockObserver = { update: jest.fn() };
    productService.attach(mockObserver);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product and notify observers', async () => {
      const mockProduct = { _id: 'prod1', name: 'New Product' };
      (Product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.create({ name: 'New Product' });

      expect(result).toEqual(mockProduct);
      expect(Product.create).toHaveBeenCalledWith({ name: 'New Product' });
      expect(mockObserver.update).toHaveBeenCalledWith({
        event: 'PRODUCT_CREATED',
        product: mockProduct
      });
    });
  });

  describe('update', () => {
    it('should update a product and notify observers', async () => {
      const mockProduct = { _id: 'prod1', name: 'Updated Product' };
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.update('prod1', { name: 'Updated Product' });

      expect(result).toEqual(mockProduct);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('prod1', { name: 'Updated Product' }, { new: true });
      expect(mockObserver.update).toHaveBeenCalledWith({
        event: 'PRODUCT_UPDATED',
        product: mockProduct
      });
    });
  });

  describe('delete', () => {
    it('should delete a product and notify observers', async () => {
      (Product.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'prod1' });

      const result = await productService.delete('prod1');

      expect(result).toBe(true);
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('prod1');
      expect(mockObserver.update).toHaveBeenCalledWith({
        event: 'PRODUCT_DELETED',
        productId: 'prod1'
      });
    });
  });

  describe('getAll', () => {
    it('should return all products', async () => {
      const mockProducts = [{ name: 'P1' }, { name: 'P2' }];
      (Product.find as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAll();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getById', () => {
    it('should return product by id', async () => {
      const mockProduct = { name: 'P1' };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getById('123');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('detach', () => {
    it('should detach observer', () => {
      productService.detach(mockObserver);
      (Product.create as jest.Mock).mockResolvedValue({});
      
      productService.create({});
      
      expect(mockObserver.update).not.toHaveBeenCalled();
    });
  });
});
