import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause for date filtering
    // Since MessageAction doesn't have a timestamp field directly,
    // we need to filter through the related message's timestamp
    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.message = {
        timestamp: {}
      };

      if (startDate) {
        whereClause.message.timestamp.gte = new Date(startDate);
      }

      if (endDate) {
        whereClause.message.timestamp.lte = new Date(endDate);
      }
    }

    // Query message actions with related message and conversation data
    const actions = await prisma.messageAction.findMany({
      where: whereClause,
      include: {
        message: {
          include: {
            conversation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      totalActions: actions.length,
      actions
    });

  } catch (error) {
    console.error("Error retrieving actions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve actions"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}