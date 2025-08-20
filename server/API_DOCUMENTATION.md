# Gymmy Phase 4: 1% Better Core System - API Documentation

## Overview

The Gymmy Phase 4 Backend provides a comprehensive API for ML-powered improvement detection with >95% accuracy. This system processes real-time workout data, detects micro-improvements, and provides detailed analytics and insights.

## Base URL

```
Production: https://api.gymmy.com
Development: http://localhost:3001
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔍 Improvement Detection API

### POST /api/improvements/detect

Detect improvements from workout data using ML algorithms.

**Request Body:**
```json
{
  "workout_data": {
    "workout_id": "workout_123",
    "user_id": "user_456",
    "session_date": "2024-01-15T10:00:00.000Z",
    "duration_minutes": 45,
    "total_volume": 2500.5,
    "total_sets": 12,
    "total_reps": 120,
    "exercises": [
      {
        "exercise_name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "weight": 135.0,
        "rest_seconds": 120
      }
    ],
    "max_weight": 185.0,
    "distance_meters": 0,
    "heart_rate": 140,
    "range_of_motion": 85,
    "form_score": 9.2,
    "technique_rating": 8.8,
    "movement_quality": 9.0,
    "rest_quality": 7.5,
    "recovery_score": 8.2,
    "adaptation_rate": 0.05
  },
  "options": {
    "enable_real_time": true,
    "include_predictions": true,
    "validation_method": "statistical",
    "confidence_threshold": 0.8
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "improvements": [
      {
        "id": "imp_1705312200000_abc123",
        "userId": "user_456",
        "dimensionId": "strength",
        "dimensionName": "Strength",
        "improvementPercentage": 0.025,
        "confidence": 0.92,
        "statisticalSignificance": 0.001,
        "pValue": 0.003,
        "zScore": 2.45,
        "effectSize": 0.35,
        "validationMethod": "statistical",
        "mlPrediction": {
          "prediction": 0.025,
          "confidence": 0.92,
          "features": { ... },
          "processingTime": 87
        },
        "scientificValidation": {
          "isValid": true,
          "confidence": 0.89,
          "researchBacking": [ ... ],
          "fitnessPrinciples": [ ... ]
        },
        "detectedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "predictions": [
      {
        "dimension": "strength",
        "timeframe": "1_month",
        "predictedImprovement": 0.08,
        "confidence": 0.85,
        "riskFactors": [ ... ],
        "recommendations": [ ... ]
      }
    ],
    "processing_metadata": {
      "request_id": "ml_1705312200000_def456",
      "processing_time": 287,
      "confidence": 0.92,
      "data_quality": 0.94,
      "model_accuracy": 0.952,
      "cache_hit": false
    }
  },
  "message": "Detected 1 improvements",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/improvements/user/:userId

Get user's improvement history.

**Query Parameters:**
- `dimension` (optional): Filter by improvement dimension
- `start_date` (optional): Start date for filtering (ISO 8601)
- `end_date` (optional): End date for filtering (ISO 8601)
- `limit` (optional): Number of records to return (1-100, default: 50)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "improvements": [
      {
        "id": "imp_1705312200000_abc123",
        "dimensionId": "strength",
        "dimensionName": "Strength",
        "improvementPercentage": 0.025,
        "confidence": 0.92,
        "detectedAt": "2024-01-15T10:30:00.000Z",
        "isCelebrated": true
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 1
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/improvements/baselines/calculate

Calculate or update user baselines.

**Request Body:**
```json
{
  "user_id": "user_456",
  "dimension_ids": ["strength", "endurance", "flexibility"],
  "time_period": "month",
  "force_recalculation": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "baselines": {
      "strength": {
        "baselineValue": 150.5,
        "standardDeviation": 12.3,
        "sampleSize": 25,
        "calculationDate": "2024-01-15T10:30:00.000Z"
      },
      "endurance": {
        "baselineValue": 35.2,
        "standardDeviation": 5.1,
        "sampleSize": 20,
        "calculationDate": "2024-01-15T10:30:00.000Z"
      }
    },
    "calculation_metadata": {
      "user_id": "user_456",
      "time_period": "month",
      "dimensions_calculated": 2
    }
  },
  "message": "Calculated baselines for 2 dimensions",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/improvements/baselines/user/:userId

Get user's current baselines.

**Query Parameters:**
- `dimension_ids` (optional): Array of dimension IDs to retrieve

**Response:**
```json
{
  "success": true,
  "data": {
    "baselines": {
      "strength": {
        "baselineValue": 150.5,
        "standardDeviation": 12.3,
        "sampleSize": 25,
        "calculationDate": "2024-01-15T10:30:00.000Z"
      }
    },
    "user_id": "user_456",
    "total_dimensions": 1
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/improvements/dimensions

Get available improvement dimensions.

**Response:**
```json
{
  "success": true,
  "data": {
    "dimensions": [
      {
        "id": "strength",
        "name": "Strength",
        "description": "Muscular strength improvements",
        "metrics": ["max_weight", "total_volume", "reps_at_weight"],
        "threshold": 0.01,
        "validation_method": "statistical",
        "celebration_type": "strength_milestone",
        "character_synergy": ["strength", "power"]
      }
    ],
    "total_dimensions": 6
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/improvements/batch

Process multiple workout sessions for improvement detection.

**Request Body:**
```json
{
  "workout_sessions": [
    {
      "workout_id": "workout_123",
      "user_id": "user_456",
      "session_date": "2024-01-15T10:00:00.000Z",
      "exercises": [ ... ]
    }
  ],
  "options": {
    "enable_parallel": true,
    "include_predictions": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "session_id": "workout_123",
        "success": true,
        "data": {
          "improvements": [ ... ],
          "processing_time": 287
        },
        "error": null
      }
    ],
    "summary": {
      "total_sessions": 1,
      "successful": 1,
      "failed": 0,
      "total_improvements": 1
    }
  },
  "message": "Processed 1 sessions: 1 successful, 0 failed",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/improvements/stats/user/:userId

Get improvement statistics for a user.

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year, all_time, default: month)
- `dimension` (optional): Filter by dimension

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_improvements": 15,
      "average_improvement": 0.023,
      "best_dimension": "strength",
      "improvement_trend": "increasing",
      "consistency_score": 0.85,
      "dimension_breakdown": {
        "strength": 8,
        "endurance": 4,
        "flexibility": 3
      }
    },
    "user_id": "user_456",
    "period": "month",
    "dimension": null
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 Analytics API

### GET /api/analytics/user/:userId

Get comprehensive analytics for a user.

**Query Parameters:**
- `period` (optional): Time period (daily, weekly, monthly, quarterly, yearly, all_time, default: monthly)
- `dimensions` (optional): Array of dimensions to include
- `include_trends` (optional): Include trend analysis (default: true)
- `include_predictions` (optional): Include predictions (default: true)
- `include_comparisons` (optional): Include comparisons (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "overview": {
        "total_workouts": 45,
        "total_improvements": 23,
        "average_improvement_rate": 0.025,
        "consistency_score": 0.87
      },
      "dimension_analytics": {
        "strength": {
          "improvements": 12,
          "average_improvement": 0.031,
          "trend": "increasing",
          "predictions": [ ... ]
        }
      },
      "trends": [ ... ],
      "predictions": [ ... ],
      "comparisons": [ ... ]
    },
    "user_id": "user_456",
    "period": "monthly",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/improvements/user/:userId

Get improvement analytics for a user.

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year, all_time, default: month)
- `dimension` (optional): Filter by dimension
- `group_by` (optional): Grouping (day, week, month, dimension, default: week)

**Response:**
```json
{
  "success": true,
  "data": {
    "improvement_analytics": {
      "summary": {
        "total_improvements": 23,
        "average_improvement": 0.025,
        "best_period": "2024-01-08",
        "most_improved_dimension": "strength"
      },
      "timeline": [
        {
          "period": "2024-01-08",
          "improvements": 5,
          "average_improvement": 0.028,
          "dimensions": { ... }
        }
      ],
      "dimension_breakdown": { ... }
    },
    "user_id": "user_456",
    "period": "month",
    "group_by": "week",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/trends/user/:userId

Get trend analysis for a user.

**Query Parameters:**
- `period` (optional): Time period (month, quarter, year, all_time, default: month)
- `dimensions` (optional): Array of dimensions to analyze
- `trend_type` (optional): Trend type (linear, exponential, seasonal, all, default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "dimension": "strength",
        "trend_type": "linear",
        "slope": 0.0023,
        "r_squared": 0.85,
        "confidence": 0.92,
        "prediction": {
          "next_month": 0.045,
          "next_quarter": 0.089
        }
      }
    ],
    "user_id": "user_456",
    "period": "month",
    "trend_type": "all",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/predictions/user/:userId

Get predictive analytics for a user.

**Query Parameters:**
- `timeframe` (optional): Prediction timeframe (1_week, 2_weeks, 1_month, 3_months, 6_months, default: 1_month)
- `dimensions` (optional): Array of dimensions to predict
- `confidence_level` (optional): Confidence level (0.5-0.99, default: 0.8)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "dimension": "strength",
        "timeframe": "1_month",
        "predicted_improvement": 0.045,
        "confidence": 0.85,
        "risk_factors": [
          {
            "factor": "overtraining",
            "probability": 0.15,
            "mitigation": "Increase rest days"
          }
        ],
        "recommendations": [
          "Focus on progressive overload",
          "Maintain current frequency"
        ]
      }
    ],
    "user_id": "user_456",
    "timeframe": "1_month",
    "confidence_level": 0.8,
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/performance/user/:userId

Get performance analytics for a user.

**Query Parameters:**
- `period` (optional): Time period (week, month, quarter, year, all_time, default: month)
- `metrics` (optional): Array of metrics to include

**Response:**
```json
{
  "success": true,
  "data": {
    "performance_analytics": {
      "workout_frequency": {
        "average_per_week": 3.2,
        "trend": "stable",
        "consistency": 0.85
      },
      "volume_progression": {
        "total_volume": 12500,
        "volume_trend": "increasing",
        "efficiency": 0.92
      },
      "intensity_metrics": {
        "average_intensity": 0.78,
        "max_intensity": 0.95,
        "intensity_distribution": { ... }
      }
    },
    "user_id": "user_456",
    "period": "month",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/comparison/user/:userId

Get comparison analytics for a user.

**Query Parameters:**
- `comparison_type` (optional): Comparison type (self, peer, benchmark, default: self)
- `period` (optional): Time period (month, quarter, year, default: month)
- `dimensions` (optional): Array of dimensions to compare

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison_analytics": {
      "self_comparison": {
        "current_period": {
          "improvements": 8,
          "average_improvement": 0.025
        },
        "previous_period": {
          "improvements": 6,
          "average_improvement": 0.020
        },
        "improvement": 0.25
      },
      "peer_comparison": {
        "percentile": 75,
        "similar_users": 150,
        "relative_performance": "above_average"
      },
      "benchmark_comparison": {
        "benchmark": "fitness_standards_2024",
        "performance": "excellent",
        "score": 0.87
      }
    },
    "user_id": "user_456",
    "comparison_type": "self",
    "period": "month",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/insights/user/:userId

Get AI-powered insights for a user.

**Query Parameters:**
- `insight_type` (optional): Insight type (improvement, performance, trend, recommendation, all, default: all)
- `period` (optional): Time period (week, month, quarter, year, default: month)

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "improvement",
        "title": "Strength Gains Accelerating",
        "description": "Your strength improvements have increased by 25% this month compared to last month.",
        "confidence": 0.92,
        "actionable": true,
        "recommendations": [
          "Continue current progressive overload strategy",
          "Consider increasing training frequency"
        ]
      },
      {
        "type": "performance",
        "title": "Workout Consistency Improving",
        "description": "You've maintained 85% workout consistency over the past month.",
        "confidence": 0.88,
        "actionable": true,
        "recommendations": [
          "Keep up the great consistency",
          "Consider adding one more session per week"
        ]
      }
    ],
    "user_id": "user_456",
    "insight_type": "all",
    "period": "month",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/dashboard/user/:userId

Get dashboard analytics for a user.

**Query Parameters:**
- `widgets` (optional): Array of widget types to include
- `refresh_cache` (optional): Force cache refresh (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "overview_widget": {
        "total_improvements": 23,
        "current_streak": 5,
        "best_dimension": "strength",
        "overall_progress": 0.78
      },
      "improvement_chart": {
        "data": [ ... ],
        "trend": "increasing"
      },
      "dimension_breakdown": {
        "strength": 35,
        "endurance": 25,
        "flexibility": 20,
        "consistency": 15,
        "technique": 3,
        "recovery": 2
      },
      "recent_achievements": [ ... ],
      "upcoming_goals": [ ... ]
    },
    "user_id": "user_456",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/analytics/export/user/:userId

Export analytics data for a user.

**Query Parameters:**
- `format` (optional): Export format (json, csv, pdf, default: json)
- `period` (optional): Time period (month, quarter, year, all_time, default: month)
- `include_data` (optional): Include raw data (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "export_data": { ... },
    "filename": "gymmy_analytics_user_456_month_2024-01-15.json",
    "format": "json",
    "period": "month",
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 ML API

### GET /api/ml/models

Get information about available ML models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "strength_model",
        "name": "Strength Improvement Model",
        "type": "ensemble",
        "accuracy": 0.952,
        "last_trained": "2024-01-10T15:30:00.000Z",
        "version": "1.2.0",
        "dimensions": ["strength"],
        "performance": {
          "processing_time": 87,
          "memory_usage": 45,
          "false_positive_rate": 0.042,
          "false_negative_rate": 0.031
        }
      }
    ],
    "total_models": 6
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/ml/performance

Get ML system performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "overall_accuracy": 0.952,
      "average_processing_time": 287,
      "total_predictions": 15420,
      "cache_hit_rate": 0.85,
      "system_health": "healthy",
      "model_performance": {
        "strength": { "accuracy": 0.952, "processing_time": 87 },
        "endurance": { "accuracy": 0.948, "processing_time": 92 },
        "flexibility": { "accuracy": 0.955, "processing_time": 78 }
      }
    },
    "generated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🏥 Health & Monitoring API

### GET /api/health

Get system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "production",
    "uptime": 86400,
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ml_models": "healthy",
      "queue": "healthy"
    },
    "performance": {
      "average_response_time": 287,
      "memory_usage": 45.2,
      "cpu_usage": 23.1,
      "active_connections": 125
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/health/metrics

Get detailed system metrics (Prometheus format).

**Response:**
```
# HELP gymmy_http_requests_total Total number of HTTP requests
# TYPE gymmy_http_requests_total counter
gymmy_http_requests_total{method="POST",endpoint="/api/improvements/detect"} 15420

# HELP gymmy_ml_processing_time_seconds ML processing time in seconds
# TYPE gymmy_ml_processing_time_seconds histogram
gymmy_ml_processing_time_seconds_bucket{le="0.1"} 1200
gymmy_ml_processing_time_seconds_bucket{le="0.5"} 14500
gymmy_ml_processing_time_seconds_bucket{le="1.0"} 15420
```

---

## 🔐 Authentication API

### POST /api/auth/login

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_456",
      "email": "user@example.com",
      "username": "fitness_user",
      "role": "user",
      "permissions": ["read:improvements", "write:workouts"]
    },
    "expires_in": 86400
  },
  "message": "Authentication successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "new_fitness_user",
  "password": "secure_password",
  "confirm_password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_789",
      "email": "newuser@example.com",
      "username": "new_fitness_user",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request format or parameters |
| 401 | Unauthorized - Authentication required or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

---

## 🚀 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Improvement Detection | 100 requests | 15 minutes |
| Analytics | 50 requests | 15 minutes |
| ML Processing | 30 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| Batch Processing | 20 requests | 1 hour |

---

## 📊 WebSocket Events

### Connection
```javascript
const socket = io('https://api.gymmy.com');

// Join user room for real-time updates
socket.emit('join-user-room', 'user_456');
```

### Events

**improvement-detected**
```javascript
socket.on('improvement-detected', (data) => {
  console.log('New improvement detected:', data);
  // data: { improvements: [...], processingTime: 287, timestamp: "..." }
});
```

**workout-data**
```javascript
// Send workout data for real-time processing
socket.emit('workout-data', {
  workout_id: 'workout_123',
  user_id: 'user_456',
  exercises: [...]
});
```

---

## 🔧 SDK Examples

### JavaScript/TypeScript
```javascript
import { GymmyAPI } from '@gymmy/sdk';

const api = new GymmyAPI({
  baseURL: 'https://api.gymmy.com',
  token: 'your-jwt-token'
});

// Detect improvements
const result = await api.improvements.detect({
  workout_data: { ... },
  options: { include_predictions: true }
});

// Get analytics
const analytics = await api.analytics.getUserAnalytics('user_456', {
  period: 'month',
  include_trends: true
});
```

### Python
```python
from gymmy import GymmyAPI

api = GymmyAPI(
    base_url='https://api.gymmy.com',
    token='your-jwt-token'
)

# Detect improvements
result = api.improvements.detect(
    workout_data={...},
    options={'include_predictions': True}
)

# Get analytics
analytics = api.analytics.get_user_analytics(
    user_id='user_456',
    period='month',
    include_trends=True
)
```

---

## 📚 Additional Resources

- [SDK Documentation](https://docs.gymmy.com/sdk)
- [Webhook Integration](https://docs.gymmy.com/webhooks)
- [Rate Limiting Guide](https://docs.gymmy.com/rate-limits)
- [Error Handling](https://docs.gymmy.com/errors)
- [Best Practices](https://docs.gymmy.com/best-practices)

---

*Last updated: January 15, 2024*
*API Version: 1.0.0*
