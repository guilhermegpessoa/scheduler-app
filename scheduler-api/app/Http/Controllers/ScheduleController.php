<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Availability;
use App\Models\Appointment;
use Illuminate\Support\Facades\Gate;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // RQF 2.2 - Availability Registration (Administrators Only)
    public function storeAvailability(Request $request)
    {
        if (auth()->user()->role !== 'administrator') {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'day_of_week' => 'required|integer|between:0,6', // 0 = Sunday, 1 = Monday...
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'is_active' => 'required|boolean',
        ]);

        if (strtotime($request->end_time) <= strtotime($request->start_time)) {
            return response()->json(['message' => 'A hora final deve ser maior que a hora inicial.'], 400);
        }

        $availability = \App\Models\Availability::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'day_of_week' => $request->day_of_week,
            ],
            [
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'is_active' => $request->is_active,
            ]
        );

        return response()->json($availability, 201);
    }

    // RQF 2.3 - Check Available Times
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date_format:Y-m-d',
        ]);

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek;

        $window = Availability::where('user_id', $request->user_id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$window) {
            return response()->json([], 200);
        }

        $bookedSlots = Appointment::where('user_id', $request->user_id)
            ->where('appointment_date', $request->date)
            ->get(['start_time', 'end_time'])
            ->toArray();

        $slots = [];
        $startTime = Carbon::parse($window->start_time);
        $endTime = Carbon::parse($window->end_time);

        while ($startTime->getTimestamp() < $endTime->getTimestamp()) {
            $slotStart = $startTime->format('H:i');
            $slotEnd = $startTime->copy()->addHour()->format('H:i');

            if (strtotime($slotEnd) > strtotime($window->end_time)) {
                break;
            }

            // RQF 2.3 - Verify that this block is free of conflicts
            $isOcupado = false;
            foreach ($bookedSlots as $booked) {
                $bStart = substr($booked['start_time'], 0, 5);
                if ($slotStart === $bStart) {
                    $isOcupado = true;
                    break;
                }
            }

            if (!$isOcupado) {
                $slots[] = [
                    'start' => $slotStart,
                    'end' => $slotEnd
                ];
            }

            $startTime->addHour();
        }

        return response()->json($slots, 200);
    }

    public function bookAppointment(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'client_name' => 'required|string',
            'client_email' => 'required|email',
        ]);

        $endTime = Carbon::parse($request->start_time)->addHour()->format('H:i');

        $appointment = Appointment::create([
            'user_id' => $request->user_id,
            'appointment_date' => $request->appointment_date,
            'start_time' => $request->start_time,
            'end_time' => $endTime,
            'client_name' => $request->client_name,
            'client_email' => $request->client_email,
        ]);

        return response()->json($appointment, 201);
    }
}