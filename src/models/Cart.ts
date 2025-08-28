import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  colour: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  colour: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: ['sm', 'md', 'lg', 'xl'],
    required: true,
  },
});

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative'],
  },
}, {
  timestamps: true,
});

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  if (this.items.length === 0) {
    this.totalAmount = 0;
    return next();
  }

  try {
    const Product = mongoose.model('Product');
    let total = 0;

    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    this.totalAmount = total;
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
