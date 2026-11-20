# Use Case Overview - Cibenda Mart

Sumber: `routes/web.php`, `routes/auth.php`, `routes/console.php`. Rincian per use case ada di `00_index.md`.

```mermaid
flowchart LR
    PG((Pengunjung))
    PB((Pembeli))
    PD((Pedagang))
    KR((Kurir Toko))
    AD((Admin))
    OP((Operator Server))
    SID[["SIDUTama"]]
    MT[["Midtrans"]]
    GO[["Google"]]
    SCH[["Scheduler"]]

    subgraph CM["Cibenda Mart"]
        G1(["Etalase dan informasi<br/>UC-01, UC-02"])
        G2(["Akun dan autentikasi<br/>UC-03 sampai UC-08, UC-22"])
        G3(["Belanja dan pembayaran<br/>UC-09 sampai UC-13"])
        G4(["Pesanan, pelacakan, ulasan<br/>UC-14 sampai UC-18"])
        G5(["Obrolan dan tawar-menawar<br/>UC-19, UC-20, UC-36, UC-37"])
        G6(["Pengelolaan toko<br/>UC-30 sampai UC-35, UC-38 sampai UC-41"])
        G7(["Pencairan saldo<br/>UC-42, UC-72, UC-73"])
        G8(["Pengantaran kurir<br/>UC-50 sampai UC-53"])
        G9(["Administrasi platform<br/>UC-60 sampai UC-66"])
        G10(["Tugas otomatis<br/>UC-70, UC-71, UC-74, UC-75"])
    end

    PG --- G1
    PG --- G2
    PB --- G1
    PB --- G2
    PB --- G3
    PB --- G4
    PB --- G5
    PD --- G1
    PD --- G2
    PD --- G3
    PD --- G4
    PD --- G5
    PD --- G6
    PD --- G7
    KR --- G8
    AD --- G9
    OP --- G9
    G2 --- GO
    G3 --- MT
    G7 --- MT
    G9 --- SID
    SCH --- G7
    SCH --- G10
    G10 --- SID
    G10 --- MT
```

Pedagang terhubung ke kelompok belanja karena rute pembeli juga dapat diakses peran `pedagang`, dengan pengecualian toko miliknya sendiri.
