<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query();

        // Filter by audience
        if ($request->has('audience')) {
            $query->where('target_audience', $request->input('audience'));
        }

        // Filter by department (if needed for future use)
        if ($request->has('department')) {
            $query->where('target_audience', 'department');
        }

        // Only active announcements
        $query->where('is_active', true);

        // Don't show expired announcements
        $query->where(function ($subQuery) {
            $subQuery->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
        });

        $announcements = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'data' => AnnouncementResource::collection($announcements->items()),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
                'from' => $announcements->firstItem(),
                'to' => $announcements->lastItem(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_audience' => 'required|in:all,students,faculty,admin',
            'attachment' => 'nullable|file|mimes:jpeg,jpg,png,gif,mp4,avi,mov,mp3,wav|max:10240',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        $attachmentPath = null;
        $attachmentType = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentType = $this->getFileType($file);
            
            // Store file in storage
            $path = $file->store('announcements', 'public');
            $attachmentPath = $path;
            $attachmentType = $attachmentType;
        }

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'attachment_path' => $attachmentPath,
            'attachment_type' => $attachmentType,
            'attachment_name' => $attachmentName,
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return response()->json(new AnnouncementResource($announcement), 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json(new AnnouncementResource($announcement));
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_audience' => 'required|in:all,students,faculty,admin',
            'attachment' => 'nullable|file|mimes:jpeg,jpg,png,gif,mp4,avi,mov,mp3,wav|max:10240',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        // Handle file upload
        $attachmentPath = $announcement->attachment_path;
        $attachmentType = $announcement->attachment_type;
        $attachmentName = $announcement->attachment_name;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentType = $this->getFileType($file);
            
            // Delete old file if exists
            if ($announcement->attachment_path) {
                Storage::disk('public')->delete($announcement->attachment_path);
            }
            
            // Store new file
            $path = $file->store('announcements', 'public');
            $attachmentPath = $path;
            $attachmentType = $attachmentType;
        }

        $announcement->update([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'attachment_path' => $attachmentPath,
            'attachment_type' => $attachmentType,
            'attachment_name' => $attachmentName,
            'is_active' => $validated['is_active'] ?? true,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return response()->json(new AnnouncementResource($announcement->fresh()));
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        // Delete attachment file if exists
        if ($announcement->attachment_path) {
            Storage::disk('public')->delete($announcement->attachment_path);
        }

        $announcement->delete();

        return response()->json(null, 204);
    }

    private function getFileType(UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();
        
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }

        return 'file';
    }
}
