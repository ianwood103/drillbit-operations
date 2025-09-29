import { PrismaClient, ConversationType, Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface ConversationFilters {
  phone?: string;
  jobType?: string;
  urgency?: number;
  type?: ConversationType;
  currentStatus?: Status;
  currentReason?: string;
  createdAt?: {
    gte?: string;
    lte?: string;
  };
  updatedAt?: {
    gte?: string;
    lte?: string;
  };
}

interface RequestBody {
  filters?: ConversationFilters;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
}

const VALID_ORDER_FIELDS = [
  'id',
  'phone',
  'jobType',
  'urgency',
  'type',
  'currentStatus',
  'currentReason',
  'createdAt',
  'updatedAt'
];

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    const {
      filters = {},
      orderBy = { field: 'createdAt', direction: 'desc' },
      page = 1,
      pageSize = 20
    } = body;

    // Validate orderBy field
    if (!VALID_ORDER_FIELDS.includes(orderBy.field)) {
      return NextResponse.json(
        { success: false, error: `Invalid order field. Must be one of: ${VALID_ORDER_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Page must be >= 1 and pageSize must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {};

    if (filters.phone) {
      where.phone = { contains: filters.phone };
    }

    if (filters.jobType) {
      where.jobType = { contains: filters.jobType };
    }

    if (filters.urgency !== undefined) {
      where.urgency = filters.urgency;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.currentStatus) {
      where.currentStatus = filters.currentStatus;
    }

    if (filters.currentReason) {
      where.currentReason = { contains: filters.currentReason };
    }

    if (filters.createdAt) {
      where.createdAt = {};
      if (filters.createdAt.gte) {
        where.createdAt.gte = new Date(filters.createdAt.gte);
      }
      if (filters.createdAt.lte) {
        where.createdAt.lte = new Date(filters.createdAt.lte);
      }
    }

    if (filters.updatedAt) {
      where.updatedAt = {};
      if (filters.updatedAt.gte) {
        where.updatedAt.gte = new Date(filters.updatedAt.gte);
      }
      if (filters.updatedAt.lte) {
        where.updatedAt.lte = new Date(filters.updatedAt.lte);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Get total count for pagination metadata
    const totalCount = await prisma.conversation.count({ where });

    // Get conversations with filters, sorting, and pagination
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: {
        [orderBy.field]: orderBy.direction
      },
      skip,
      take,
      include: {
        messages: {
          include: {
            actions: true
          },
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      },
      filters: filters,
      orderBy: orderBy
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}