import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  price: number;
  colour: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  images: string[];
  inStock: boolean;
  totalStock: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Product description cannot exceed 2000 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  colour: {
    type: String,
    required: [true, 'Product colour is required'],
    trim: true,
  },
  size: {
    type: String,
    enum: ['sm', 'md', 'lg', 'xl'],
    required: [true, 'Product size is required'],
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required'],
  }],
  inStock: {
    type: Boolean,
    default: true,
  },
  totalStock: {
    type: Number,
    required: [true, 'Total stock is required'],
    min: [0, 'Total stock cannot be negative'],
  },
  soldCount: {
    type: Number,
    default: 0,
    min: [0, 'Sold count cannot be negative'],
  },
}, {
  timestamps: true,
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ price: 1 });
productSchema.index({ inStock: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
