<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesanan Baru Masuk - CiMart</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            color: #333333;
            -webkit-text-size-adjust: none;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f6f8;
            padding: 30px 0;
        }
        .main-card {
            background-color: #ffffff;
            margin: 0 auto;
            max-width: 580px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #14433D 0%, #1c5e55 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0;
            font-size: 13px;
            color: #a8c6c5;
        }
        .content {
            padding: 24px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .badge-new {
            background-color: #EAF7F7;
            color: #14433D;
            border: 1px solid #41B9C5;
        }
        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin: 18px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            color: #64748b;
        }
        .info-value {
            font-weight: 700;
            color: #0f172a;
            text-align: right;
        }
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
        }
        .table-items th {
            text-align: left;
            padding: 10px 8px;
            border-bottom: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
        }
        .table-items td {
            padding: 12px 8px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
        }
        .total-section {
            border-top: 2px dashed #cbd5e1;
            padding-top: 16px;
            margin-top: 16px;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 12px;
        }
        .btn-primary {
            display: inline-block;
            background-color: #14433D;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 6px -1px rgba(20, 67, 61, 0.2);
        }
        .footer {
            text-align: center;
            padding: 24px;
            font-size: 11px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-card">
            <!-- Header Banner -->
            <div class="header">
                <h1>Pesanan Baru Masuk!</h1>
                <p>{{ $order->store?->name ?? 'Toko Anda' }} • CiMart Pangandaran</p>
            </div>

            <!-- Content -->
            <div class="content">
                <div style="text-align: center; margin-bottom: 16px;">
                    <span class="badge badge-new">Menunggu Diproses</span>
                </div>

                <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px; text-align: center; color: #475569;">
                    Halo <strong>{{ $order->store?->name }}</strong>, ada pesanan baru masuk dari <strong>{{ $order->customer_name }}</strong>. Segera periksa dan siapkan produk pesanan pembeli.
                </p>

                <!-- Order Info Box -->
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">No. Invoice:</span>
                        <span class="info-value" style="font-family: monospace; color: #14433D;">#{{ $order->invoice_number }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nama Pembeli:</span>
                        <span class="info-value">{{ $order->customer_name }} ({{ $order->customer_phone }})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Metode Pengiriman:</span>
                        <span class="info-value">
                            {{ $order->delivery_method === 'local_delivery' ? 'Kurir Toko (Lokal)' : 'Ambil Sendiri' }}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Metode Pembayaran:</span>
                        <span class="info-value" style="color: {{ $order->payment_method === 'cod' ? '#d97706' : '#059669' }};">
                            {{ $order->payment_method === 'cod' ? 'COD (Bayar di Tempat)' : 'Lunas (Online)' }}
                        </span>
                    </div>
                    <div class="info-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                        <span class="info-label">Alamat Antar:</span>
                        <span class="info-value" style="font-weight: 500; font-size: 12px; max-width: 65%;">{{ $order->shipping_address }}</span>
                    </div>
                </div>

                <!-- Products Table -->
                <table class="table-items">
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($order->items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->product_name }}</strong>
                                @if (!empty($item->variant_name))
                                    <br><span style="font-size: 11px; color: #64748b;">Varian: {{ $item->variant_name }}</span>
                                @endif
                            </td>
                            <td style="text-align: center;">{{ $item->quantity }} {{ $item->unit ?? 'pcs' }}</td>
                            <td style="text-align: right; font-weight: 600;">Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>

                <!-- Summary Breakdown -->
                <div class="total-section">
                    <div class="info-row">
                        <span class="info-label">Subtotal Produk:</span>
                        <span class="info-value">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ongkos Kirim Toko:</span>
                        <span class="info-value">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
                    </div>
                    <div class="info-row" style="font-size: 16px; margin-top: 10px; color: #14433D;">
                        <span><strong>Total Pesanan:</strong></span>
                        <span style="font-weight: 900; color: #14433D;">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
                    </div>
                </div>

                <!-- CTA Button -->
                <div class="btn-container">
                    <a href="{{ url('/pedagang/orders') }}" class="btn-primary" target="_blank">
                        Buka Dashboard Pesanan &rarr;
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 4px;">Email otomatis dikirim oleh sistem e-Commerce CiMart (Cibenda Mart).</p>
                <p style="margin: 0;">Pangandaran, Jawa Barat &bull; &copy; {{ date('Y') }} CiMart</p>
            </div>
        </div>
    </div>
</body>
</html>
