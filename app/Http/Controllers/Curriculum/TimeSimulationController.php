<?php

namespace App\Http\Controllers\Curriculum;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class TimeSimulationController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
        ], [
            'date.required' => 'Tanggal wajib diisi.',
            'date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'time.required' => 'Jam wajib diisi.',
            'time.date_format' => 'Format jam tidak valid (HH:mm).',
        ]);

        $datetimeString = "{$data['date']} {$data['time']}:00";
        $datetime = Carbon::parse($datetimeString);

        Cache::forever('simulated_time', $datetime->toDateTimeString());

        $formatted = $datetime->locale('id')->isoFormat('dddd, D MMMM YYYY - HH:mm');

        return redirect()->back()->with('flash', [
            'success' => "Waktu simulasi berhasil diubah ke {$formatted} WIB.",
        ]);
    }

    public function reset(): RedirectResponse
    {
        Cache::forget('simulated_time');

        return redirect()->back()->with('flash', [
            'success' => 'Waktu simulasi berhasil direset ke waktu asli.',
        ]);
    }
}
